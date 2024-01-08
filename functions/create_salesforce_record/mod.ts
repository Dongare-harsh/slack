import { CreateSalesForceRecord } from "./definition.ts";
import { SlackFunction } from "deno-slack-sdk/mod.ts";

export default SlackFunction(
    CreateSalesForceRecord,
    async ({ inputs, env }) => {
        console.log(`Create Salesforce Record request of: ${JSON.stringify(inputs)}`);

        const domain = env["SALESFORCE_BASE_DOMAIN"];
        const clientId = env["SALESFORCE_CLIENT_ID"]
        const clientSecret = env["SALESFORCE_CLIENT_SECRET"]

        // Get OAuth token
        console.log(`Retrevieng OAuth token from https://${domain}/services/oauth2/token`);
        const oauthResponse = await fetch(`https://${domain}/services/oauth2/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`
        });
        const oauthData = await oauthResponse.json();
        const token = oauthData.access_token;
        console.log(`OAuth token retrieved`);
        // Create Salesforce record
        console.log(`Creating Salesforce record in https://${domain}/services/data/v59.0/sobjects/${inputs.salesforce_record_name}/`);
        const recordResponse = await fetch(`https://${domain}/services/data/v59.0/sobjects/${inputs.salesforce_record_name}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(inputs.salesforce_record)
        });

        const recordData = await recordResponse.json();

        console.log(`Salesforce record created: ${JSON.stringify(recordData)}`);

        return {
            completed: true
        }
    },

)
