import accessRequestData from "./formdata.ts";

function generateOptions(values: string[]) {
    return values.map((value, index) => {
        return {
            "text": {
                "type": "plain_text",
                "text": value,
                "emoji": true
            },
            "value": value
        };
    });
}

function generateInitialOption(value: string) {
    return {
        "text": {
            "type": "plain_text",
            "text": value,
            "emoji": true
        },
        "value": value
    };
}

export function getBPGUI(initialValue?: string) {
    const element: any = {
        "type": "static_select",
        "placeholder": {
            "type": "plain_text",
            "text": "Select the BPG the application belongs to",
            "emoji": true
        },
        "options": generateOptions(accessRequestData.bpgs),
        "action_id": "bgp-action-id"
    };

    if (initialValue) {
        element.initial_option = generateInitialOption(initialValue);
    }

    return {
        "type": "input",
        "dispatch_action": true,
        "element": element,
        "label": {
            "type": "plain_text",
            "text": "Business Partner Group (BPG)",
            "emoji": true
        }
    };
}

export function getSubBPGUI(bpg: string, initialValue?: string) {
    const element: any = {
        "type": "static_select",
        "placeholder": {
            "type": "plain_text",
            "text": "Select the Sub-BPG the application belongs to",
            "emoji": true
        },
        "options": generateOptions(accessRequestData.bpgToSubBpg[bpg]),
        "action_id": "sub-bgp-action-id"
    };

    if (initialValue) {
        element.initial_option = generateInitialOption(initialValue);
    }

    return {
        "type": "input",
        "dispatch_action": true,
        "element": element,
        "label": {
            "type": "plain_text",
            "text": "Sub-Business Partner Group (Sub-BPG)",
            "emoji": true
        }
    };
}

export function getApplicationUI(subBpg: string) {
    return {
        "type": "input",
        "element": {
            "type": "static_select",
            "placeholder": {
                "type": "plain_text",
                "text": "Select an Application",
                "emoji": true
            },
            "options": generateOptions(accessRequestData.applications[subBpg]),
            "action_id": "application-action-id"
        },
        "label": {
            "type": "plain_text",
            "text": "Application",
            "emoji": true
        }
    }
}

export function getJustificationUI() {
    return {
        "type": "input",
        "element": {
            "type": "plain_text_input",
            "action_id": "justification_action_id",
            "placeholder": {
                "type": "plain_text",
                "text": "Enter the reason you require access to this application"
            },
            "multiline": true
        },
        "label": {
            "type": "plain_text",
            "text": "Business Justification",
            "emoji": true
        }
    }
}

export function getAccessRequestUI() {
    return {
        "type": "modal",
        // Note that this ID can be used for dispatching view submissions and view closed events.
        "callback_id": "access-request-modal",
        // This option is required to be notified when this modal is closed by the user
        "notify_on_close": true,
        "title": {
            "type": "plain_text",
            "text": "App Request Workflow",
            "emoji": true
        },
        "close": {
            "type": "plain_text",
            "text": "Cancel",
            "emoji": true
        },
        "blocks": [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": "Application Access Request",
                    "emoji": true
                }
            },
            {
                "type": "context",
                "elements": [
                    {
                        "type": "plain_text",
                        "text": "Please fill out the items below in order to submit an access request, once submitted it will be sent for review for an approver, you will be notified on its completion.",
                        "emoji": true
                    }
                ]
            },
            {
                "type": "divider"
            },
        ]
    };
}