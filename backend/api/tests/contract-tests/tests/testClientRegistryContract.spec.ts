"use strict";

import {MatchersV3, PactV3} from "@pact-foundation/pact";
import * as path from "path";
import axios from "axios";

beforeAll((): void => {
    jest.setTimeout(200000);
});

const EXPECTED_BODY =
    "{\n" +
    '"client_name": "My test service",\n' +
    '"public_key": "1234567890",\n' +
    '"redirect_uris": ["http://localhost/"],\n' +
    '"contacts": ["pacttest.account@digital.cabinet-office.gov.uk"],\n' +
    '"scopes": ["openid", "email", "phone"],\n' +
    '"subject_type": "pairwise",\n' +
    '"service_type": "MANDATORY",\n' +
    '"sector_identifier_uri": "http://gov.uk"\n' +
    "}";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const postRequest = async (url, data): string => {
    const postUrl = `${url}/connect/register`;
    const headers = {headers: {responseType: "json", "Content-Type": "application/json; charset=utf-8"}};
    console.log("********** postRequest sending to :" + postUrl);
    return await axios
        .post(postUrl, data, headers)
        .then(res => {
            console.log("********** postRequest returning : " + res.data.toString());
            return res.data.toString();
        })
        .catch(err => {
            console.log("********** postRequest error : " + err.toString());
            return "ERROR: " + err.toString();
        });
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const putRequest = async (url, data): string => {
    const postUrl = `${url}/connect/register`;
    const headers = {headers: {responseType: "json", "Content-Type": "application/json; charset=utf-8"}};
    console.log("********** putRequest sending to :" + postUrl);
    return await axios
        .put(postUrl, data, headers)
        .then(res => {
            console.log("********** putRequest returning : " + res.data.toString());
            return res.data.toString();
        })
        .catch(err => {
            console.log("********** putRequest error : " + err.toString());
            return "ERROR: " + err.toString();
        });
};

describe("ClientRegistryProvider", () => {
    const {eachLike} = MatchersV3;

    const provider = new PactV3({
        dir: path.resolve(process.cwd(), "pacts"),
        logLevel: "debug",
        port: 8080,
        consumer: "SSEAdminAPIClient",
        provider: "ClientRegistryProvider"
    });

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
                const [results] = await Promise.all([postRequest(mockProvider.url, EXPECTED_BODY)]);
                console.log("RESULTS: " + JSON.stringify(results));
                expect(results).toContain(EXPECTED_BODY);
            });
        });
    });

    describe("When a PUT request is made to update a client", () => {
        test("it should return a message", async () => {
            provider
                .uponReceiving("update a Client")
                .withRequest({
                    method: "PUT",
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
                const [results] = await Promise.all([putRequest(mockProvider.url, EXPECTED_BODY)]);
                console.log("RESULTS: " + JSON.stringify(JSON.stringify(results)));
                expect(results).toContain(EXPECTED_BODY);
            });
        });
    });
});
