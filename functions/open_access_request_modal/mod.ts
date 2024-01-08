import { SlackFunction } from "deno-slack-sdk/mod.ts";
import {
    getAccessRequestUI,
    getBPGUI,
    getSubBPGUI,
    getApplicationUI,
    getJustificationUI
} from "./blocks.ts";
import accessRequestData from "./formdata.ts";
import { OpenAccessRequestModalFunction } from "./definition.ts";

export default SlackFunction(
    OpenAccessRequestModalFunction,
    // ---------------------------
    // The first handler function that opens a modal.
    // This function can be called when the workflow executes the function step.
    // ---------------------------
    async ({inputs, body, client}) => {
        // Open a new modal with the end-user who interacted with the link trigger
        const response = await client.views.open({
            interactivity_pointer: inputs.interactivity.interactivity_pointer,
            view: {...getAccessRequestUI(), blocks: [...getAccessRequestUI().blocks, getBPGUI()]},
        });
        if (response.error) {
            const error =
                `Failed to open a modal in the demo workflow. Contact the app maintainers with the following information - (error: ${response.error})`;
            return {error};
        }
        return {
            // To continue with this interaction, return false for the completion
            completed: false,
        };
    },
).addBlockActionsHandler(
    ['bgp-action-id'],
    async function ({action, body, client}) {
        const subBpgs = accessRequestData.bpgToSubBpg[action.selected_option.value];
        const blocks = [
            ...getAccessRequestUI().blocks,
            getBPGUI(action.selected_option.value)
        ];

        if (subBpgs.length === 1) {
            blocks.push(getApplicationUI(subBpgs[0]));
            blocks.push(getJustificationUI());
        } else {
            blocks.push(getSubBPGUI(action.selected_option.value));
        }

        await client.views.update({
            view_id: body.view.id,
            view: {
                ...getAccessRequestUI(),
                blocks: blocks,
                "submit": subBpgs.length === 1 ? {
                    "type": "plain_text",
                    "text": "Submit",
                    "emoji": true
                } : undefined
            },
        });
    },
).addBlockActionsHandler(
    ['sub-bgp-action-id'],
    async function ({action, body, client}) {
        let bpg = '';
        for (let id in body.view.state.values) {
            if (body.view.state.values[id].hasOwnProperty("bgp-action-id")) {
                bpg = body.view.state.values[id]["bgp-action-id"].selected_option.value;
            }
        }
        await client.views.update({
            view_id: body.view.id,
            view: {
                ...getAccessRequestUI(),
                blocks: [...getAccessRequestUI().blocks,
                    getBPGUI(bpg),
                    getSubBPGUI(bpg, action.selected_option.value),
                    getApplicationUI(action.selected_option.value),
                    getJustificationUI(),
                ],
                "submit": {
                    "type": "plain_text",
                    "text": "Submit",
                    "emoji": true,
                }
            },
        });
    },
)
    // ---------------------------
    // The handler that can be called when the above modal data is submitted.
    // It saves the inputs from the first page as private_metadata,
    // and then displays the second-page modal view.
    // ---------------------------
    .addViewSubmissionHandler(["access-request-modal"], async ({view, client, body}) => {
        // Extract user info for requestor details
        const userInfo = await client.users.info({
            user: body.user.id
        });

        // Extract the input values from the view data
        let bpg = '';
        let subBpg = '';
        let application = '';
        let justification = '';
        for (let id in body.view.state.values) {
            if (body.view.state.values[id].hasOwnProperty("bgp-action-id")) {
                bpg = body.view.state.values[id]["bgp-action-id"].selected_option.value;
            }
            if (body.view.state.values[id].hasOwnProperty("sub-bgp-action-id")) {
                subBpg = body.view.state.values[id]["sub-bgp-action-id"].selected_option.value;
            }
            if (body.view.state.values[id].hasOwnProperty("application-action-id")) {
                application = body.view.state.values[id]["application-action-id"].selected_option.value;
            }
            if (body.view.state.values[id].hasOwnProperty("justification_action_id")) {
                justification = body.view.state.values[id]["justification_action_id"].value;
            }
        }
        if (!subBpg) {
            subBpg = bpg;
        }

        await client.functions.completeSuccess({
            function_execution_id: body.function_data.execution_id,
            outputs: {
                interactivity: body.interactivity,
                requestor_id: body.user.id,
                requestor_name: userInfo.user.real_name,
                requestor_email: userInfo.user.profile.email,
                bpg: bpg,
                sub_bpg: subBpg,
                application: application,
                justification: justification
            },
        });

        return {response_action: "clear"};
    })