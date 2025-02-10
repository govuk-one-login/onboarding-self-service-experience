("use strict");

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import pkg from "@pact-foundation/pact-node";
const {publishPacts} = pkg;

import {resolve} from "path";

const brokerUrl = process.env.PACT_URL || "";
const brokerUsername = process.env.PACT_USER || "";
const brokerPassword = process.env.PACT_PASSWORD || "";

const consumerVersion = process.env.CONSUMER_APP_VERSION || "";

const publishPact = async () => {
    try {
        const publishOptions = {
            pactFilesOrDirs: [resolve(process.cwd(), "pacts")],
            pactBroker: brokerUrl,
            pactBrokerUsername: brokerUsername,
            pactBrokerPassword: brokerPassword,
            logLevel: "info",
            consumerVersion: consumerVersion,
            branch: process.env.GIT_BRANCH
        };

        const result = await publishPacts(publishOptions);
        console.log("Successfully published pacts: ", result);
    } catch (err) {
        console.error("Unable to publish pacts: ", err);
        process.exitCode = 1;
    }
};

void publishPact();
