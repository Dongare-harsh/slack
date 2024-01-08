import {DefineDatastore, Schema} from "deno-slack-sdk/mod.ts";

export const AccessRequestDataStore = DefineDatastore({
    name: "access_request",
    primary_key: "id",
    attributes: {
        id: {
            type: Schema.types.string,
        },
        requestor_id: {
            type: Schema.slack.types.user_id,
        },
        requestor_name: {
            type: Schema.types.string,
        },
        requestor_email: {
            type: Schema.types.string,
        },
        bpg: {
            type: Schema.types.string,
        },
        sub_bpg: {
            type: Schema.types.string,
        },
        application: {
            type: Schema.types.string,
        },
        justification: {
            type: Schema.types.string,
        },
        created_on: {
            type: Schema.slack.types.timestamp,
        },
        in_review: {
            type: Schema.types.boolean,
        },
        is_approved: {
            type: Schema.types.boolean,
        },
        approved_by: {
            type: Schema.slack.types.user_id,
        },
        approver_name: {
            type: Schema.types.string,
        },
        approver_email: {
            type: Schema.types.string,
        },
        updated_on: {
            type: Schema.slack.types.timestamp,
        },
    }
});

export default AccessRequestDataStore;