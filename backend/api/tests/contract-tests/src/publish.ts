("use strict");

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import pkg from "@pact-foundation/pact-node";
const {publishPacts} = pkg;

import {resolve} from "path";

const brokerUrl = process.env.PACT_BROKER_BASE_URL || "";
const brokerUsername = process.env.PACT_BROKER_USERNAME || "";
const brokerPassword = process.env.PACT_BROKER_PASSWORD || "";

const consumerVersion = "1.0.0";
const providerVersion = "1.0.0";

const publishPact = async () => {
    try {
        const publishOptions = {
            pactFilesOrDirs: ["src/pacts"],
            pactBroker: brokerUrl,
            pactBrokerUsername: brokerUsername,
            pactBrokerPassword: brokerPassword,
            pactUrls: [resolve(process.cwd(), "src/pacts")],
            logLevel: "debug",
            consumerVersion: consumerVersion,
            providerVersion: providerVersion,
            providersVersionTags: ""
        };

        const result = await publishPacts(publishOptions);
        console.log("Successfully published pacts: ", result);
    } catch (err) {
        console.error("Unable to publish pacts: ", err);
        process.exitCode = 1;
    }
};

void publishPact();
