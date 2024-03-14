import {getServiceClientsHandler} from "../../../src/handlers/dynamodb/get-service-clients";
import DynamoDbClient from "../../../src/dynamodb-client";
import {APIGatewayEventDefaultAuthorizerContext, APIGatewayProxyEvent, APIGatewayProxyEventBase} from "aws-lambda";
import ResolvedValue = jest.ResolvedValue;

const serviceId = "1ded3d65-d088-4319-9431-ea5a3323799d";

function createTestEvent(overrides: Partial<APIGatewayProxyEvent>): APIGatewayProxyEvent {
    return <APIGatewayProxyEventBase<APIGatewayEventDefaultAuthorizerContext>>{
        body: null,
        headers: {},
        // etc.
        ...overrides
    };
}

function createResolvedValue(): ResolvedValue<string> {
    return <ResolvedValue<string>>{
        $metadata: {
            httpStatusCode: 200,
            requestId: "8KGKUN6Q08NM228UKKUUMDV073VV4KQNSO5AEMVJF66Q9ASUAAJG",
            attempts: 1,
            totalRetryDelay: 0
        },
        Count: 1,
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
                            S: "jane.jones@test.gov.uk"
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
        ],
        ScannedCount: 1
    };
}

const resolvedBody =
    '{"$metadata":{"httpStatusCode":200,"requestId":"8KGKUN6Q08NM228UKKUUMDV073VV4KQNSO5AEMVJF66Q9ASUAAJG","attempts":1,"totalRetryDelay":0},"Count":1,"Items":[{"service_name":{"S":"My test service 3"},"post_logout_redirect_uris":{"L":[{"S":"http://localhost/home/root"}]},"subject_type":{"S":"pairwise"},"contacts":{"L":[{"S":"jane.jones@test.gov.uk"},{"S":"onboarding@digital.cabinet-office.gov.uk"}]},"public_key":{"S":"MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEAp2mLkQGo24Kz1rut0oZlviMkGomlQCH+iT1pFvegZFXq39NPjRWyatmXp/XIUPqCq9Kk8/+tq4Sgjw+EM5tATJ06j5r+35of58ATGVPniW//IhGizrv6/ebGcGEUJ0Y/ZmlCHYPV+lbewpttQ/IYKM1nr3k/Rl6qepbVYe+MpGubluQvdhgUYel9OzxiOvUk7XI0axPquiXzoEgmNNOai8+WhYTkBqE3/OucAv+XwXdnx4XHmKzMwTv93dYMpUmvTxWcSeEJ/4/SrbiK4PyHWVKU2BozfSUejVNhahAzZeyyDwhYJmhBaZi/3eOOlqGXj9UdkOXbl3vcwBH8wD30O9/4F5ERLKxzOaMnKZ+RpnygWF0qFhf+UeFMy+O06sdgiaFnXaSCsIy/SohspkKiLjNnhvrDNmPLMQbQKQlJdcp6zUzI7Gzys7luEmOxyMpA32lDBQcjL7KNwM15s4ytfrJ46XEPZUXESce2gj6NazcPPsrTa/Q2+oLS9GWupGh7AgMBAAE="},"client_name":{"S":"integration"},"scopes":{"L":[{"S":"openid"},{"S":"email"},{"S":"phone"}]},"clientId":{"S":"Qo9i8QAbBP8c6dxsOByJe0LYnh8"},"default_fields":{"L":[{"S":"data"},{"S":"public_key"},{"S":"redirect_uris"},{"S":"scopes"},{"S":"post_logout_redirect_uris"},{"S":"subject_type"},{"S":"service_type"}]},"redirect_uris":{"L":[{"S":"http://localhost/"}]},"sk":{"S":"client#92a02561-4c53-4c37-b238-35bff489e85e"},"pk":{"S":"service#13c229f8-a1cc-4ba7-bd17-1a245591007e"},"service_type":{"S":"MANDATORY"},"type":{"S":"integration"}}],"ScannedCount":1}';

describe("getServiceClientsHandler tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("calls the dynamo client with a get command with the expected values and returns a 200 with the expected response body", async () => {
        const itemSpy = jest.spyOn(DynamoDbClient.prototype, "getClients").mockResolvedValue(createResolvedValue());

        const serviceHandlerResponse = await getServiceClientsHandler(createTestEvent({pathParameters: {serviceId: serviceId}}));

        expect(itemSpy).toHaveBeenCalledWith(serviceId);

        expect(serviceHandlerResponse).toStrictEqual({
            statusCode: 200,
            body: resolvedBody
        });
    });

    it("calls the dynamo client with a get command with the expected values and returns a 500 when the dynamo client throws an error", async () => {
        const error = "SomeAwsError";
        const itemSpy = jest.spyOn(DynamoDbClient.prototype, "getClients").mockRejectedValue(error);

        const serviceHandlerResponse = await getServiceClientsHandler(createTestEvent({pathParameters: {serviceId: serviceId}}));

        expect(itemSpy).toHaveBeenCalledWith(serviceId);

        expect(serviceHandlerResponse).toStrictEqual({
            statusCode: 500,
            body: JSON.stringify(error)
        });
    });

    it("calls the dynamo client with a get command without the expected values and returns a 400 when the dynamo client throws an error", async () => {
        const error = "No userId request parameter supplied";

        const serviceHandlerResponse = await getServiceClientsHandler(createTestEvent({}));

        expect(serviceHandlerResponse).toStrictEqual({
            statusCode: 400,
            body: JSON.stringify(error)
        });
    });
});
