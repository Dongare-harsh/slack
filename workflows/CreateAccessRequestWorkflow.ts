import {DefineWorkflow, Schema} from "deno-slack-sdk/mod.ts";
import {OpenAccessRequestModalFunction} from "../functions/open_access_request_modal/definition.ts";
import {SendAccessRequestToChannelFunction} from "../functions/send_access_request_to_approvers/definition.ts";
import {CreateSalesForceRecord} from "../functions/create_salesforce_record/definition.ts";

/**
 * A Workflow composed of two steps: asking for access request details from the user
 * that started the workflow, and then forwarding the details along with two
 * buttons (approve and deny) to the approver's channel.
 */

export const CreateAccessRequestWorkflow = DefineWorkflow({
    callback_id: "create_access_request",
    title: "Request Access",
    description:
        "Create an access request and send it for approval.",
    input_parameters: {
        properties: {
            interactivity: {
                type: Schema.slack.types.interactivity,
            },
        },
        required: ["interactivity"],
    },
});

// Step 1: opening a form for the user to input their time off details.
const accessRequestModal = CreateAccessRequestWorkflow.addStep(
    OpenAccessRequestModalFunction
    , {interactivity: CreateAccessRequestWorkflow.inputs.interactivity}
);


// Step 2: send time off request details along with approve/deny buttons to manager
const sendAccessRequestToChannel = CreateAccessRequestWorkflow.addStep(SendAccessRequestToChannelFunction, {
    interactivity: accessRequestModal.outputs.interactivity,
    requestor_id: accessRequestModal.outputs.requestor_id,
    requestor_name: accessRequestModal.outputs.requestor_name,
    requestor_email: accessRequestModal.outputs.requestor_email,
    bpg: accessRequestModal.outputs.bpg,
    sub_bpg: accessRequestModal.outputs.sub_bpg,
    application: accessRequestModal.outputs.application,
    justification: accessRequestModal.outputs.justification,
});

if (sendAccessRequestToChannel.outputs.salesforce_record_name && sendAccessRequestToChannel.outputs.salesforce_record) {
    // Step 3: create a record in Salesforce
    CreateAccessRequestWorkflow.addStep(CreateSalesForceRecord, {
        salesforce_record_name: sendAccessRequestToChannel.outputs.salesforce_record_name,
        salesforce_record: sendAccessRequestToChannel.outputs.salesforce_record,
    });
}
