"use strict";

import {MatchersV3, PactV3} from "@pact-foundation/pact";
import * as path from "path";
import axios from "axios";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const postRequest = async (url, data): string => {
    const postUrl = `${url}/connect/register`;
    const headers = {headers: {responseType: "json", "Content-Type": "application/json; charset=utf-8"}};
    return await axios
        .post(postUrl, data, headers)
        .then(res => {
            return res.data.toString();
        })
        .catch(err => {
            return "ERROR: " + err.toString();
        });
};

const {eachLike} = MatchersV3;

const provider = new PactV3({
    dir: path.resolve(process.cwd(), "pacts"),
    consumer: "SSEAdminAPIClient",
    provider: "ClientRegistryProvider"
});

const EXPECTED_BODY =
    "{\n" +
    'client_name: "My test service",\n' +
    'public_key: "1234567890",\n' +
    'redirect_uris: ["http://localhost/"],\n' +
    'contacts: ["pacttest.account@digital.cabinet-office.gov.uk"],\n' +
    'scopes: ["openid", "email", "phone"],\n' +
    'subject_type: "pairwise",\n' +
    'service_type: "MANDATORY",\n' +
    'sector_identifier_uri: "http://gov.uk"\n' +
    "}";

describe("ClientRegistryProvider", () => {
    describe("When a POST request is made to create a client", () => {
        test("it should return a message", async () => {
            provider
                .uponReceiving("add a Client")
                .withRequest({
                    method: "POST",
                    path: "/connect/register",
                    contentType: "application/json",
                    headers: {
                        "Content-Type": "application/json; charset=utf-8"
                    },
                    body: EXPECTED_BODY
                })
                .willRespondWith({
                    status: 200,
                    body: eachLike(EXPECTED_BODY),
                    contentType: "application/json",
                    headers: {
                        "Content-Type": "application/json; charset=utf-8"
                    }
                });

            await provider.executeTest(async mockProvider => {
                const results = postRequest(mockProvider.url, EXPECTED_BODY);
                console.log("RESULTS: " + JSON.stringify(results));
                expect(results).toContain(EXPECTED_BODY);
            });
        });
    });
});
