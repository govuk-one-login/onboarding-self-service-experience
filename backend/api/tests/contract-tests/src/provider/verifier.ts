"use strict";

import {Verifier} from "@pact-foundation/pact";
import {VerifierOptions} from "@pact-foundation/pact/src/dsl/verifier/types";
import * as console from "console";

const brokerUrl = process.env.PACT_BROKER_BASE_URL || "";
const brokerUsername = process.env.PACT_BROKER_USERNAME || "";
const brokerPassword = process.env.PACT_BROKER_PASSWORD || "";

const providerVersion = "1.0.0";
const providerName = "ClientRegistryProvider";

const opts: VerifierOptions = {
    beforeEach: async () => {
        console.log("***** I run before everything else");
    },
    afterEach: async () => {
        console.log("***** I run after everything else has finished");
    },
    stateHandlers: {
        null: async () => {
            console.log("***** Default state handler invoked");
        },
        "Client not exists": async () => {
            console.log("***** A client is added");
        },
        "Client exists": async () => {
            console.log("***** A client is updated");
        }
    },
    provider: providerName,
    providerVersion: providerVersion,
    providerBaseUrl: "https://0fai4c2zd8.execute-api.eu-west-2.amazonaws.com/pacts/provider/ClientRegistryProvider",
    pactBrokerUrl: brokerUrl,
    pactBrokerUsername: brokerUsername,
    pactBrokerPassword: brokerPassword,
    consumerVersionSelectors: [
        {
            latest: true
        }
    ],
    enablePending: false,
    publishVerificationResult: true,
    logLevel: "debug"
};

console.log("OPTIONS: " + JSON.stringify(opts));

export const doVerifier = async (opts: VerifierOptions) => {
    const verifier = new Verifier(opts);
    await verifier
        .verifyProvider()
        .then(res =>
            // tslint:disable-next-line: no-console
            console.log("Successfully verified pacts; result code: " + res)
        )
        .catch(error => {
            // tslint:disable-next-line: no-console
            console.log(error);
            process.exit(1);
        });
};

doVerifier(opts).then(() => console.log("Done"));
