import { DefineFunction, Schema } from "deno-slack-sdk/mod.ts";
/**
 * Custom function that sends a message to the approver channel asking for approval
 * for an access request. The message includes some Block Kit with two interactive
 * buttons: one to approve, and one to deny.
 */
export const SendAccessRequestToChannelFunction = DefineFunction({
    callback_id: "send_access_request_to_channel",
    title: "Request Access",
    description: "Sends your access for review which will be approved or denied.",
    source_file: "functions/send_access_request_to_approvers/mod.ts",
    input_parameters: {
        properties: {
            interactivity: {type: Schema.slack.types.interactivity},
            requestor_id: {
                type: Schema.slack.types.user_id,
                description: "The user requesting access",
            },
            requestor_name: {
                type: Schema.types.string,
                description: "The name of the user requesting access"
            },
            requestor_email: {
                type: Schema.types.string,
                description: "The email of the user requesting access"
            },
            bpg: {
                type: Schema.types.string,
                description: "The business process group"
            },
            sub_bpg: {
                type: Schema.types.string,
                description: "The sub business process group"
            },
            application: {
                type: Schema.types.string,
                description: "The application"
            },
            justification: {
                type: Schema.types.string,
                description: "The justification for having access to the specified system."
            },
        },
        required: ["interactivity", "requestor_id", "requestor_name", "requestor_email", "bpg", "sub_bpg", "application", "justification"]
    },
    output_parameters: {
        properties: {
            salesforce_record_name: {
                type: Schema.types.string,
                description: "The name of the record to be created",
            },
            salesforce_record: {
                type: Schema.types.object,
                description: "The record to be created"
            }
        },
        required: ["salesforce_record_name", "salesforce_record"]
    },
});
