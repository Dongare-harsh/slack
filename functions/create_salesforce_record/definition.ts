import { DefineFunction, Schema } from "deno-slack-sdk/mod.ts";

export const CreateSalesForceRecord = DefineFunction({
    callback_id: "create_salesforce_record",
    title: "Create Salesforce Record",
    description: "Creates a record in Salesforce",
    source_file: "functions/create_salesforce_record/mod.ts",
    input_parameters: {
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
    output_parameters: {
        properties: {},
        required: []
    },
});
