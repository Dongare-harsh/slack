import {Trigger} from "deno-slack-sdk/types.ts";
import {TriggerContextData, TriggerTypes} from "deno-slack-api/mod.ts";

const trigger: Trigger = {
    type: TriggerTypes.Shortcut,
    name: "Request Access",
    description: "Request access to a system",
    workflow: "#/workflows/create_access_request",
    inputs: {
        interactivity: {
            value: TriggerContextData.Shortcut.interactivity,
        },
    },
};

export default trigger;
