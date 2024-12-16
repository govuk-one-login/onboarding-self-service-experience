"use strict";

import {MatchersV3, PactV3} from "@pact-foundation/pact";
import * as path from "path";
import {public_key, registerClientHandler, RegisterClientPayload} from "../../../src/handlers/auth/register-client";
import {clientConfigRequest} from "../../../src/handlers/types/client-config-request";
import {clientRegistryResponse} from "../../../src/handlers/types/client-registry-response";
import {mockLambdaContext} from "../../handlers/utils";
import {updateClientInRegistryHandler, UpdateClientPayload} from "../../../src/handlers/auth/update-client";

beforeAll((): void => {
    jest.setTimeout(200000);
});

describe("ClientRegistryProvider", () => {
    const {like} = MatchersV3;

    const provider = new PactV3({
        dir: path.resolve(process.cwd(), "pacts"),
        logLevel: "debug",
        port: 8080,
        consumer: "SSEAdminAPIClient",
        provider: "ClientRegistryProvider"
    });

    describe("When a POST request is made to create a client", () => {
        const postEvent: RegisterClientPayload = {
            contactEmail: "pacttest.account@digital.cabinet-office.gov.uk",
            service: {
                serviceName: "My test service",
                id: "service#testRandomId"
            }
        };

        const client_config: clientConfigRequest = {
            client_name: postEvent.service.serviceName,
            public_key: public_key,
            redirect_uris: ["http://localhost/"],
            contacts: [postEvent.contactEmail],
            scopes: ["openid", "email", "phone"],
            subject_type: "pairwise",
            service_type: "MANDATORY",
            sector_identifier_uri: "http://gov.uk",
            client_locs: ["P2"]
        };

        const expected_response: clientRegistryResponse = createExpectedResponse();

        expected_response.client_name = client_config.client_name;
        expected_response.public_key = client_config.public_key;
        expected_response.redirect_uris = client_config.redirect_uris;
        expected_response.contacts = client_config.contacts;
        expected_response.scopes = client_config.scopes;
        expected_response.subject_type = client_config.subject_type;
        expected_response.service_type = client_config.service_type;
        expected_response.sector_identifier_uri = client_config.sector_identifier_uri;
        expected_response.public_key_source = null;
        expected_response.channel = null;

        test("it should return an a client registry object when adding a client", async () => {
            provider
                .uponReceiving("configuration to add a client")
                .withRequest({
                    method: "POST",
                    path: "/connect/register",
                    contentType: "application/json",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(client_config)
                })
                .willRespondWith({
                    status: 200,
                    body: like(expected_response),
                    contentType: "application/json",
                    headers: {
                        "Content-Type": "application/json"
                    }
                });

            await provider.executeTest(async mockProvider => {
                process.env.AUTH_REGISTRATION_BASE_URL = mockProvider.url;
                const results = await registerClientHandler(postEvent, mockLambdaContext);
                expect(JSON.parse(results.body)).toMatchObject(expected_response);
            });
        });
    });

    describe("When a PUT request is made to update a client", () => {
        const updatesForClient = {
            contacts: ["new.email@digital.cabinet-office.gov.uk"],
            subject_type: "pairwise"
        };

        const putEvent: UpdateClientPayload = {
            clientId: "testClientIdExampleText1234",
            serviceId: "testServiceId",
            selfServiceClientId: "testSelfServiceClientId",
            updates: {
                ...updatesForClient
            }
        };

        const expected_response: clientRegistryResponse = createExpectedResponse();

        expected_response.contacts = updatesForClient.contacts;
        expected_response.subject_type = updatesForClient.subject_type;

        test("it should return an a client registry object when updating a client", async () => {
            provider
                .uponReceiving("configuration to update a client")
                .withRequest({
                    method: "PUT",
                    path: `/connect/register/${putEvent.clientId}`,
                    contentType: "application/json",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: updatesForClient
                })
                .willRespondWith({
                    status: 200,
                    body: like(expected_response),
                    contentType: "application/json",
                    headers: {
                        "Content-Type": "application/json"
                    }
                });

            await provider.executeTest(async mockProvider => {
                process.env.AUTH_REGISTRATION_BASE_URL = mockProvider.url;
                const results = await updateClientInRegistryHandler(putEvent, mockLambdaContext);
                expect(JSON.parse(results.body)).toMatchObject(expected_response);
            });
        });
    });

    function createExpectedResponse(): clientRegistryResponse {
        return {
            client_name: "testClientUpdateResponseName",
            public_key: "testClientPublicKey",
            public_key_source: "STATIC",
            redirect_uris: ["http://testClientUrl"],
            contacts: [],
            scopes: ["openid", "email"],
            subject_type: "pairwise",
            service_type: "MANDATORY",
            sector_identifier_uri: "http://gov.uk",
            client_id: "testClientIdExampleText1234",
            post_logout_redirect_uris: [],
            back_channel_logout_uri: null,
            token_endpoint_auth_method: "private_key_jwt",
            response_type: "code",
            jar_validation_required: false,
            claims: [],
            client_type: "web",
            id_token_signing_algorithm: "ES256",
            jwks_uri: null,
            channel: "WEB",
            max_age_enabled: false
        };
    }
});
