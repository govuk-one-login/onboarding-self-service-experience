import {
    deleteDynamoDBClientEntriesHandler,
    deleteDynamoDBServiceEntriesHandler,
    getDynamoDBEntriesHandler
} from "../../../src/handlers/dynamodb/dynamo-db-service";
import DynamoDbClient from "../../../src/dynamodb-client";
import {APIGatewayEventDefaultAuthorizerContext, APIGatewayProxyEvent, APIGatewayProxyEventBase} from "aws-lambda";
import ResolvedValue = jest.ResolvedValue;

const userEmail = "test@test.gov.uk";

function createGetEntriesTestEvent(overrides: Partial<APIGatewayProxyEvent>): APIGatewayProxyEvent {
    return <APIGatewayProxyEventBase<APIGatewayEventDefaultAuthorizerContext>>{
        body: null,
        headers: {},
        // etc.
        ...overrides
    };
}

function createGetEntriesResolvedValue(): ResolvedValue<string> {
    return <ResolvedValue<string>>{
        Items: [
            {
                service_name: {
                    S: "My test service 3"
                },
                post_logout_redirect_uris: {
                    L: [
                        {
                            S: "http://localhost/home/root"
                        }
                    ]
                },
                subject_type: {
                    S: "pairwise"
                },
                contacts: {
                    L: [
                        {
                            S: userEmail
                        },
                        {
                            S: "onboarding@digital.cabinet-office.gov.uk"
                        }
                    ]
                },
                public_key: {
                    S: "MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEAp2mLkQGo24Kz1rut0oZlviMkGomlQCH+iT1pFvegZFXq39NPjRWyatmXp/XIUPqCq9Kk8/+tq4Sgjw+EM5tATJ06j5r+35of58ATGVPniW//IhGizrv6/ebGcGEUJ0Y/ZmlCHYPV+lbewpttQ/IYKM1nr3k/Rl6qepbVYe+MpGubluQvdhgUYel9OzxiOvUk7XI0axPquiXzoEgmNNOai8+WhYTkBqE3/OucAv+XwXdnx4XHmKzMwTv93dYMpUmvTxWcSeEJ/4/SrbiK4PyHWVKU2BozfSUejVNhahAzZeyyDwhYJmhBaZi/3eOOlqGXj9UdkOXbl3vcwBH8wD30O9/4F5ERLKxzOaMnKZ+RpnygWF0qFhf+UeFMy+O06sdgiaFnXaSCsIy/SohspkKiLjNnhvrDNmPLMQbQKQlJdcp6zUzI7Gzys7luEmOxyMpA32lDBQcjL7KNwM15s4ytfrJ46XEPZUXESce2gj6NazcPPsrTa/Q2+oLS9GWupGh7AgMBAAE="
                },
                client_name: {
                    S: "integration"
                },
                scopes: {
                    L: [
                        {
                            S: "openid"
                        },
                        {
                            S: "email"
                        },
                        {
                            S: "phone"
                        }
                    ]
                },
                clientId: {
                    S: "Qo9i8QAbBP8c6dxsOByJe0LYnh8"
                },
                default_fields: {
                    L: [
                        {
                            S: "data"
                        },
                        {
                            S: "public_key"
                        },
                        {
                            S: "redirect_uris"
                        },
                        {
                            S: "scopes"
                        },
                        {
                            S: "post_logout_redirect_uris"
                        },
                        {
                            S: "subject_type"
                        },
                        {
                            S: "service_type"
                        }
                    ]
                },
                redirect_uris: {
                    L: [
                        {
                            S: "http://localhost/"
                        }
                    ]
                },
                sk: {
                    S: "client#92a02561-4c53-4c37-b238-35bff489e85e"
                },
                pk: {
                    S: "service#13c229f8-a1cc-4ba7-bd17-1a245591007e"
                },
                service_type: {
                    S: "MANDATORY"
                },
                type: {
                    S: "integration"
                }
            }
        ]
    };
}

const getEntriesResolvedBody =
    '{"service_name":{"S":"My test service 3"},"post_logout_redirect_uris":{"L":[{"S":"http://localhost/home/root"}]},"subject_type":{"S":"pairwise"},"contacts":{"L":[{"S":"test@test.gov.uk"},{"S":"onboarding@digital.cabinet-office.gov.uk"}]},"public_key":{"S":"MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEAp2mLkQGo24Kz1rut0oZlviMkGomlQCH+iT1pFvegZFXq39NPjRWyatmXp/XIUPqCq9Kk8/+tq4Sgjw+EM5tATJ06j5r+35of58ATGVPniW//IhGizrv6/ebGcGEUJ0Y/ZmlCHYPV+lbewpttQ/IYKM1nr3k/Rl6qepbVYe+MpGubluQvdhgUYel9OzxiOvUk7XI0axPquiXzoEgmNNOai8+WhYTkBqE3/OucAv+XwXdnx4XHmKzMwTv93dYMpUmvTxWcSeEJ/4/SrbiK4PyHWVKU2BozfSUejVNhahAzZeyyDwhYJmhBaZi/3eOOlqGXj9UdkOXbl3vcwBH8wD30O9/4F5ERLKxzOaMnKZ+RpnygWF0qFhf+UeFMy+O06sdgiaFnXaSCsIy/SohspkKiLjNnhvrDNmPLMQbQKQlJdcp6zUzI7Gzys7luEmOxyMpA32lDBQcjL7KNwM15s4ytfrJ46XEPZUXESce2gj6NazcPPsrTa/Q2+oLS9GWupGh7AgMBAAE="},"client_name":{"S":"integration"},"scopes":{"L":[{"S":"openid"},{"S":"email"},{"S":"phone"}]},"clientId":{"S":"Qo9i8QAbBP8c6dxsOByJe0LYnh8"},"default_fields":{"L":[{"S":"data"},{"S":"public_key"},{"S":"redirect_uris"},{"S":"scopes"},{"S":"post_logout_redirect_uris"},{"S":"subject_type"},{"S":"service_type"}]},"redirect_uris":{"L":[{"S":"http://localhost/"}]},"sk":{"S":"client#92a02561-4c53-4c37-b238-35bff489e85e"},"pk":{"S":"service#13c229f8-a1cc-4ba7-bd17-1a245591007e"},"service_type":{"S":"MANDATORY"},"type":{"S":"integration"}}';

describe("updateServiceClientHandler tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("calls the dynamo client with a scan command with the expected values and returns a 200 with the expected response body", async () => {
        const itemSpy = jest.spyOn(DynamoDbClient.prototype, "getListOfClients").mockResolvedValue(createGetEntriesResolvedValue());

        const serviceHandlerResponse = await getDynamoDBEntriesHandler(createGetEntriesTestEvent({pathParameters: {userEmail: userEmail}}));

        expect(itemSpy).toBeCalledTimes(1);

        expect(serviceHandlerResponse).toStrictEqual({
            statusCode: 200,
            body: getEntriesResolvedBody
        });
    });

    it("calls the dynamo client with a scan command with the expected values and throws an error when the dynamo client throws an error", async () => {
        const error = "SomeAwsError";
        const itemSpy = jest.spyOn(DynamoDbClient.prototype, "getListOfClients").mockRejectedValue(error);

        await getDynamoDBEntriesHandler(createGetEntriesTestEvent({pathParameters: {userEmail: userEmail}})).catch(
            updateServiceHandlerResponse => {
                expect(itemSpy).toBeCalledTimes(1);
                expect(updateServiceHandlerResponse).toStrictEqual(error);
            }
        );
    });
});

function createDeletClientEntriesTestEvent(overrides: Partial<APIGatewayProxyEvent>): APIGatewayProxyEvent {
    return <APIGatewayProxyEventBase<APIGatewayEventDefaultAuthorizerContext>>{
        body: '{"userId": "123","serviceId":"456"}',
        headers: {},
        // etc.
        ...overrides
    };
}

describe("deleteDynamoDBClientEntriesHandler tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("calls the dynamo client with a delete command with the expected values and returns a 200 with the expected response body", async () => {
        const itemSpy = jest.spyOn(DynamoDbClient.prototype, "deleteDynamoDBClientEntries").mockResolvedValue();

        const serviceHandlerResponse = await deleteDynamoDBClientEntriesHandler(createDeletClientEntriesTestEvent({pathParameters: {}}));

        expect(itemSpy).toBeCalledTimes(1);

        expect(serviceHandlerResponse).toStrictEqual({
            statusCode: 200,
            body: '""'
        });
    });

    it("calls the dynamo client with a delete command with the expected values and throws an error when the dynamo client throws an error", async () => {
        const error = "SomeAwsError";
        const itemSpy = jest.spyOn(DynamoDbClient.prototype, "deleteDynamoDBClientEntries").mockRejectedValue(error);

        await deleteDynamoDBClientEntriesHandler(createDeletClientEntriesTestEvent({pathParameters: {}})).catch(serviceHandlerResponse => {
            expect(itemSpy).toBeCalledTimes(1);
            expect(serviceHandlerResponse).toStrictEqual(error);
        });
    });
});

function createDeletServiceEntriesTestEvent(overrides: Partial<APIGatewayProxyEvent>): APIGatewayProxyEvent {
    return <APIGatewayProxyEventBase<APIGatewayEventDefaultAuthorizerContext>>{
        body: '{"serviceId":"456"}',
        headers: {},
        // etc.
        ...overrides
    };
}

describe("deleteDynamoDBServiceEntriesHandler tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("calls the dynamo client with a delete command with the expected values and returns a 200 with the expected response body", async () => {
        const itemSpy = jest.spyOn(DynamoDbClient.prototype, "deleteDynamoDBServiceEntries").mockResolvedValue();

        const serviceHandlerResponse = await deleteDynamoDBServiceEntriesHandler(createDeletServiceEntriesTestEvent({pathParameters: {}}));

        expect(itemSpy).toBeCalledTimes(1);

        expect(serviceHandlerResponse).toStrictEqual({
            statusCode: 200,
            body: '""'
        });
    });

    it("calls the dynamo client with a delete command with the expected values and throws an error when the dynamo client throws an error", async () => {
        const error = "SomeAwsError";
        const itemSpy = jest.spyOn(DynamoDbClient.prototype, "deleteDynamoDBServiceEntries").mockRejectedValue(error);

        await deleteDynamoDBServiceEntriesHandler(createDeletServiceEntriesTestEvent({pathParameters: {}})).catch(
            serviceHandlerResponse => {
                expect(itemSpy).toBeCalledTimes(1);
                expect(serviceHandlerResponse).toStrictEqual(error);
            }
        );
    });
});
