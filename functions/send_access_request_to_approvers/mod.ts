import { SendAccessRequestToChannelFunction } from "./definition.ts";
import { SlackFunction } from "deno-slack-sdk/mod.ts";
import { APPROVE_ID, DENY_ID } from "./constants.ts";
import { AccessRequestDataStore } from "../../datastores/access.ts"
import accessRequestHeaderBlocks from "./blocks.ts";

// Custom function that sends a message to the user's manager asking
// for approval for the time off request. The message includes some Block Kit with two
// interactive buttons: one to approve, and one to deny.
export default SlackFunction(
    SendAccessRequestToChannelFunction,
    async ({ inputs, client }) => {
        const accessId = crypto.randomUUID()

        // Create a block of Block Kit elements composed of several header blocks
        // plus the interactive approve/deny buttons at the end
        const blocks = accessRequestHeaderBlocks(inputs).concat([{
            "type": "actions",
            "block_id": "approve-deny-buttons",
            "elements": [
                {
                    type: "button",
                    text: {
                        type: "plain_text",
                        text: "Approve",
                    },
                    action_id: APPROVE_ID, // <-- important! we will differentiate between buttons using these IDs
                    style: "primary",
                },
                {
                    type: "button",
                    text: {
                        type: "plain_text",
                        text: "Deny",
                    },
                    action_id: DENY_ID, // <-- important! we will differentiate between buttons using these IDs
                    style: "danger",
                },
            ],
        }]);

        // Interaction with access datastore

        const newRequest = await client.apps.datastore.put({
            datastore: AccessRequestDataStore.name,
            item: {
                id: accessId,
                requestor_id: inputs.requestor_id,
                requestor_name: inputs.requestor_name,
                requestor_email: inputs.requestor_email,
                bpg: inputs.bpg,
                sub_bpg: inputs.sub_bpg,
                application: inputs.application,
                in_review: true,
                is_approved: false,
                created_on: Math.floor(Date.now() / 1000),
            },
        });

        console.log('create-record', newRequest);

        if (!newRequest.ok) {
            console.log('Error during creating record:', newRequest.error)
        }

        // Send the message to the channel
        const msgResponse = await client.chat.postMessage({
            channel: '#slack-automation-approve',
            blocks,
            // Fallback text to use when rich media can't be displayed (i.e. notifications) as well as for screen readers
            text: {
                msg: "A new access request has been submitted",
                access_id: accessId,
            }
        });

        if (!msgResponse.ok) {
            console.log("Error during request chat.postMessage!", msgResponse.error);
        }

        // IMPORTANT! Set `completed` to false in order to keep the interactivity
        // points (the approve/deny buttons) "alive"
        // We will set the function's complete state in the button handlers below.
        return {
            completed: false
        };
    },
    // Create an 'actions handler', which is a function that will be invoked
    // when specific interactive Block Kit elements (like buttons!) are interacted
    // with.
).addBlockActionsHandler(
    // listen for interactions with components with the following action_ids
    [APPROVE_ID, DENY_ID],
    // interactions with the above two action_ids get handled by the function below
    async function ({ action, body, client }) {
        console.log("Incoming action handler invocation", action);

        const approved = action.action_id === APPROVE_ID;
        const { access_id } = JSON.parse(body.message.text)

        // Send approver's response as a message to employee
        const msgResponse = await client.chat.postMessage({
            channel: body.function_data.inputs.requestor_id,
            blocks: [{
                type: "context",
                elements: [
                    {
                        type: "mrkdwn",
                        text:
                            `Your access request to ${body.function_data.inputs.application} was` +
                            ` ${
                                approved ? " :white_check_mark: Approved" : ":x: Denied"
                            } by <@${body.user.id}>`,
                    },
                ],
            }],
            text: `Your access request was ${approved ? "approved" : "denied"}!`,
        });
        if (!msgResponse.ok) {
            console.log(
                "Error during requester update chat.postMessage!",
                msgResponse.error,
            );
        }

        // Update the approver's message to remove the buttons and reflect the approval
        // state. Nice little touch to prevent further interactions with the buttons
        // after one of them were clicked.
        const msgUpdate = await client.chat.update({
            channel: body.container.channel_id,
            ts: body.container.message_ts,
            blocks: accessRequestHeaderBlocks(body.function_data.inputs).concat([
                {
                    type: "context",
                    elements: [
                        {
                            type: "mrkdwn",
                            text: `${
                                approved ? " :white_check_mark: Approved" : ":x: Denied"
                            }`,
                        },
                    ],
                },
            ]),
        });
        if (!msgUpdate.ok) {
            console.log("Error during approver chat.update!", msgUpdate.error);
        }

        const approver = await client.users.info({
            user: body.user.id,
        });

        const getRequestRecord = await client.apps.datastore.get(
            {
                datastore: AccessRequestDataStore.name,
                id: access_id,
            },
        );

        const requestUpdate = await client.apps.datastore.update({
            datastore: AccessRequestDataStore.name,
            item: {
                ...getRequestRecord.item,
                in_review: false,
                is_approved: approved ? true : false,
                approved_by: body.user.id,
                approver_name: approver.user.real_name,
                approver_email: approver.user.profile.email,
                updated_on: Math.floor(Date.now() / 1000),
            },
        });

        console.log('record-update', requestUpdate);

        if(!requestUpdate.ok) {
            console.log('Error occur while update request:', requestUpdate.error);
        }

        if (approved) {
            const ouputs = {
                salesforce_record_name: "Access_Request__c",
                salesforce_record: {
                    requestor_id__c: body.function_data.inputs.requestor_id,
                    requestor_name__c: body.function_data.inputs.requestor_name,
                    requestor_email__c: body.function_data.inputs.requestor_email,
                    bpg__c: body.function_data.inputs.bpg,
                    sub_bpg__c: body.function_data.inputs.sub_bpg,
                    application__c: body.function_data.inputs.application,
                    justification__c: body.function_data.inputs.justification,
                    approver_id__c: body.user.id,
                    approver_name__c: approver.user.real_name,
                    approver_email__c: approver.user.profile.email,
                }
            }

            // And now we can mark the function as 'completed' - which is required as
            // we explicitly marked it as incomplete in the main function handler.
            await client.functions.completeSuccess({
                function_execution_id: body.function_data.execution_id,
                outputs: ouputs,
            });
        } else {
            await client.functions.completeSuccess({
                function_execution_id: body.function_data.execution_id,
                output: {}
            });
        }

    },
);
