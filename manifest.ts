import {Manifest} from "deno-slack-sdk/mod.ts";
import {AccessRequestDataStore} from "./datastores/access.ts";
import {CreateAccessRequestWorkflow} from "./workflows/CreateAccessRequestWorkflow.ts";
import {SendAccessRequestToChannelFunction} from "./functions/send_access_request_to_approvers/definition.ts";
import {OpenAccessRequestModalFunction} from "./functions/open_access_request_modal/definition.ts";
import {CreateSalesForceRecord} from "./functions/create_salesforce_record/definition.ts";
import "std/dotenv/load.ts";

/**
 * The app manifest contains the app's configuration. This
 * file defines attributes like app name and description.
 * https://api.slack.com/future/manifest
 */
export default Manifest({
    name: "slack-automation-poc",
    description: "A proof of concept for automation access requests from Slack to Salesforce",
    icon: "assets/permission.png",
    datastores: [AccessRequestDataStore],
    functions: [SendAccessRequestToChannelFunction, OpenAccessRequestModalFunction, CreateSalesForceRecord],
    workflows: [CreateAccessRequestWorkflow],
    outgoingDomains: [
        Deno.env.get("SALESFORCE_BASE_DOMAIN")!,
    ],
    botScopes: [
        "commands",
        "chat:write",
        "chat:write.public",
        "datastore:read",
        "datastore:write",
        "users:read",
        "users:read.email"
    ],
    "features": {
        "slash_commands": [
            {
                "command": "/access-request-poc",
                "description": "Request access to a system",
                "usage_hint": "/access-request-poc",
                "url": "https://slack.com/shortcuts/Ft0694F60LPK/9a4e41ff5cc5e62747eaffaa9f72c307"
            }
        ]
    }
});
