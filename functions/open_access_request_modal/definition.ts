import { DefineFunction, Schema } from "deno-slack-sdk/mod.ts";

export const OpenAccessRequestModalFunction = DefineFunction({
    callback_id: "open_access_request_modal",
    title: "Open Access Request Modal",
    description: "Opens a modal to request access to a system.",
    source_file: "functions/open_access_request_modal/mod.ts",
    input_parameters: {
        properties: {interactivity: {type: Schema.slack.types.interactivity}},
        required: ["interactivity"],
    },
    output_parameters: {
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
});
