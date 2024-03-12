import {putServiceClientHandler} from "../../../src/handlers/dynamodb/put-service-client";
import DynamoDbClient from "../../../src/dynamodb-client";

const originalEnv = process.env;

const randomId = "1234Random";
jest.mock("crypto", () => ({
    randomUUID: jest.fn(() => randomId)
}));

const testRegistrationResponse = {
    client_name: "Test Service",
    public_key:
        "MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEAp2mLkQGo24Kz1rut0oZlviMkGomlQCH+iT1pFvegZFXq39NPjRWyatmXp/XIUPqCq9Kk8/+tq4Sgjw+EM5tATJ06j5r+35of58ATGVPniW//IhGizrv6/ebGcGEUJ0Y/ZmlCHYPV+lbewpttQ/IYKM1nr3k/Rl6qepbVYe+MpGubluQvdhgUYel9OzxiOvUk7XI0axPquiXzoEgmNNOai8+WhYTkBqE3/OucAv+XwXdnx4XHmKzMwTv93dYMpUmvTxWcSeEJ/4/SrbiK4PyHWVKU2BozfSUejVNhahAzZeyyDwhYJmhBaZi/3eOOlqGXj9UdkOXbl3vcwBH8wD30O9/4F5ERLKxzOaMnKZ+RpnygWF0qFhf+UeFMy+O06sdgiaFnXaSCsIy/SohspkKiLjNnhvrDNmPLMQbQKQlJdcp6zUzI7Gzys7luEmOxyMpA32lDBQcjL7KNwM15s4ytfrJ46XEPZUXESce2gj6NazcPPsrTa/Q2+oLS9GWupGh7AgMBAAE=",
    redirect_uris: ["http://localhost/"],
    contacts: ["test.test@test.gov.uk"],
    scopes: ["openid", "email", "phone"],
    subject_type: "pairwise",
    service_type: "MANDATORY",
    sector_identifier_uri: "http://gov.uk",
    client_id: "someTestClientId",
    post_logout_redirect_uris: [],
    back_channel_logout_uri: null,
    token_endpoint_auth_method: "private_key_jwt",
    response_type: "code",
    jar_validation_required: false,
    identity_verification_enabled: false,
    client_type: "web",
    service: {
        id: "service#1234Random",
        serviceName: "Test Service"
    },
    contactEmail: "test.test@test.gov.uk"
};

const expectedDynamoRecord = {
    pk: testRegistrationResponse.service.id,
    sk: `client#${randomId}`,
    clientId: testRegistrationResponse.client_id,
    type: "integration",
    public_key: testRegistrationResponse.public_key,
    redirect_uris: testRegistrationResponse.redirect_uris,
    contacts: testRegistrationResponse.contacts,
    scopes: testRegistrationResponse.scopes,
    subject_type: testRegistrationResponse.subject_type,
    service_type: testRegistrationResponse.service_type,
    client_name: "integration",
    service_name: testRegistrationResponse.service.serviceName,
    identity_verification_enabled: false,
    claims: [],
    back_channel_logout_uri: testRegistrationResponse.back_channel_logout_uri,
    sector_identifier_uri: testRegistrationResponse.sector_identifier_uri,
    default_fields: [
        "data",
        "public_key",
        "redirect_uris",
        "scopes",
        "post_logout_redirect_uris",
        "subject_type",
        "service_type",
        "identity_verification_enabled",
        "claims",
        "sector_identifier_uri",
        "back_channel_logout_uri"
    ]
};

describe("putServiceClientHandler tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env = {
            ...originalEnv,
            IDENTITY_VERIFICATION_ENABLED: "Yes"
        };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it("calls the dynamo client with a put command with the expected values and returns a 200 with the expected response body", async () => {
        const putItemSpy = jest.spyOn(DynamoDbClient.prototype, "put").mockResolvedValue({
            $metadata: {}
        });

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const putServiceHandlerResponse = await putServiceClientHandler({
            body: JSON.stringify(testRegistrationResponse)
        });

        expect(putItemSpy).toHaveBeenCalledWith(expectedDynamoRecord);
        expect(putServiceHandlerResponse).toStrictEqual({
            statusCode: 200,
            body: JSON.stringify(expectedDynamoRecord)
        });
    });

    it("calls the dynamo client with a put command with the expected values and returns a 500 when the dynamo client throws an error", async () => {
        const error = "SomeAwsError";
        const putItemSpy = jest.spyOn(DynamoDbClient.prototype, "put").mockRejectedValue(error);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const putServiceHandlerResponse = await putServiceClientHandler({
            body: JSON.stringify(testRegistrationResponse)
        });

        expect(putItemSpy).toHaveBeenCalledWith(expectedDynamoRecord);
        expect(putServiceHandlerResponse).toStrictEqual({
            statusCode: 500,
            body: JSON.stringify(error)
        });
    });
});
