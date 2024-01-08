/**
 * Based on user-inputted data, assemble a Block Kit approval message for easy
 * parsing by the approving manager.
 */
// deno-lint-ignore no-explicit-any
export default function accessRequestHeaderBlocks(inputs: any): any[] {
    return [
        {
            type: "header",
            text: {
                type: "plain_text",
                text: `A new access request has been submitted`,
            },
        },
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: `*Requestor's Slack ID:* <@${inputs.requestor_id}>`,
            },
        },
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: `*Requestor's Name:* ${inputs.requestor_name}`,
            },
        },
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: `*Requestor's Email:* ${inputs.requestor_email}`,
            },
        },
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: `*BPG:* ${inputs.bpg}`,
            },
        },
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: `*Sub-BPG:* ${inputs.sub_bpg}`,
            },
        },
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: `*Application:* ${inputs.application}`,
            },
        },
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: `*Justification:* ${inputs.justification}`,
            },
        },
    ];
}
