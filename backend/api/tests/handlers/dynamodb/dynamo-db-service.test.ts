import {
    deleteDynamoDBClientEntriesHandler,
    deleteDynamoDBServiceEntriesHandler,
    getDynamoDBEntriesHandler
} from "../../../src/handlers/dynamodb/dynamo-db-service";
import DynamoDbClient from "../../../src/dynamodb-client";
import {constructTestApiGatewayEvent} from "../utils";
import {TEST_ACCESS_TOKEN, TEST_DATA_TABLE_ITEM, TEST_SERVICE_ID, TEST_USER_EMAIL, TEST_USER_ID} from "../constants";

describe("getDynamoDBEntriesHandler tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("calls the getListOfClients and returns the client which includes the userEmail specified in the path params", async () => {
        const getListOfItemsSpy = jest
            .spyOn(DynamoDbClient.prototype, "getListOfClients")
            .mockResolvedValue({Items: [TEST_DATA_TABLE_ITEM], $metadata: {httpStatusCode: 200}});

        const serviceHandlerResponse = await getDynamoDBEntriesHandler(
            constructTestApiGatewayEvent({
                body: "",
                pathParameters: {userEmail: TEST_USER_EMAIL},
                headers: {Authorization: `Bearer ${TEST_ACCESS_TOKEN}`}
            })
        );

        expect(getListOfItemsSpy).toHaveBeenCalledTimes(1);
        expect(serviceHandlerResponse).toStrictEqual({
            statusCode: 200,
            body: JSON.stringify(TEST_DATA_TABLE_ITEM)
        });
    });

    it("calls the dynamo client with a scan command with the expected values and throws an error when the dynamo client throws an error", async () => {
        const error = "SomeAwsError";
        const getListOfItemsSpy = jest.spyOn(DynamoDbClient.prototype, "getListOfClients").mockRejectedValue(new Error(error));
        const testEvent = constructTestApiGatewayEvent({
            body: "",
            pathParameters: {userEmail: TEST_USER_EMAIL},
            headers: {Authorization: `Bearer ${TEST_ACCESS_TOKEN}`}
        });

        await expect(getDynamoDBEntriesHandler(testEvent)).rejects.toThrow(error);
        expect(getListOfItemsSpy).toHaveBeenCalledTimes(1);
    });

    it("returns a 400 for no userEmail parameter", async () => {
        const getListOfItemsSpy = jest
            .spyOn(DynamoDbClient.prototype, "getListOfClients")
            .mockResolvedValue({Items: [TEST_DATA_TABLE_ITEM], $metadata: {httpStatusCode: 200}});

        const getUserResponse = await getDynamoDBEntriesHandler(
            constructTestApiGatewayEvent({body: "", pathParameters: {}, headers: {Authorization: `Bearer ${TEST_ACCESS_TOKEN}`}})
        );
        expect(getUserResponse).toStrictEqual({
            statusCode: 400,
            body: "Missing userEmail parameter in request"
        });
        expect(getListOfItemsSpy).not.toHaveBeenCalled();
    });

    it("returns an empty string in the body field if there is no matching email in the list of clients", async () => {
        const TEST_CLIENT_ENTRY_WITH_DIFFERENT_EMAIL = {
            ...TEST_DATA_TABLE_ITEM,
            contacts: {
                L: [...TEST_DATA_TABLE_ITEM.contacts.L]
            }
        };
        TEST_CLIENT_ENTRY_WITH_DIFFERENT_EMAIL.contacts.L = [{S: "someEmailWhichDoesNotMatchTheProvidedOne"}];

        const getListOfItemsSpy = jest
            .spyOn(DynamoDbClient.prototype, "getListOfClients")
            .mockResolvedValue({Items: [TEST_CLIENT_ENTRY_WITH_DIFFERENT_EMAIL], $metadata: {httpStatusCode: 200}});

        const serviceHandlerResponse = await getDynamoDBEntriesHandler(
            constructTestApiGatewayEvent({
                body: "",
                pathParameters: {userEmail: TEST_USER_EMAIL},
                headers: {Authorization: `Bearer ${TEST_ACCESS_TOKEN}`}
            })
        );

        expect(getListOfItemsSpy).toHaveBeenCalledTimes(1);
        expect(serviceHandlerResponse).toStrictEqual({
            statusCode: 200,
            body: JSON.stringify("")
        });
    });
});

describe("deleteDynamoDBClientEntriesHandler tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("calls the dynamo client with a delete command with the expected values and returns a 200 with the expected response body", async () => {
        const deleteEntriesSpy = jest.spyOn(DynamoDbClient.prototype, "deleteDynamoDBClientEntries").mockResolvedValue();
        const checkServiceUserExistSpy = jest.spyOn(DynamoDbClient.prototype, "checkServiceUserExists").mockResolvedValue(true);

        const serviceHandlerResponse = await deleteDynamoDBClientEntriesHandler(
            constructTestApiGatewayEvent({
                body: JSON.stringify({
                    userId: TEST_USER_ID,
                    serviceId: TEST_SERVICE_ID
                }),
                pathParameters: {},
                headers: {Authorization: `Bearer ${TEST_ACCESS_TOKEN}`}
            })
        );

        expect(checkServiceUserExistSpy).toHaveBeenCalledWith(TEST_SERVICE_ID, TEST_USER_ID);
        expect(deleteEntriesSpy).toHaveBeenCalledWith(TEST_USER_ID, TEST_SERVICE_ID);
        expect(serviceHandlerResponse).toStrictEqual({
            statusCode: 200,
            body: JSON.stringify("")
        });
    });

    it("throws an error when no userId is provided in the event body", async () => {
        const deleteEntriesSpy = jest.spyOn(DynamoDbClient.prototype, "deleteDynamoDBClientEntries").mockResolvedValue();

        await expect(
            deleteDynamoDBClientEntriesHandler(
                constructTestApiGatewayEvent({
                    body: JSON.stringify({
                        serviceId: TEST_SERVICE_ID
                    }),
                    pathParameters: {},
                    headers: {Authorization: `Bearer ${TEST_ACCESS_TOKEN}`}
                })
            )
        ).rejects.toThrow("No details provided for DeleteDynamoDBClientEntries");
        expect(deleteEntriesSpy).not.toHaveBeenCalled();
    });

    it("throws an error when no serviceId is provided in the event body", async () => {
        const deleteEntriesSpy = jest.spyOn(DynamoDbClient.prototype, "deleteDynamoDBClientEntries").mockResolvedValue();

        await expect(
            deleteDynamoDBClientEntriesHandler(
                constructTestApiGatewayEvent({
                    body: JSON.stringify({
                        userId: TEST_USER_ID
                    }),
                    pathParameters: {},
                    headers: {Authorization: `Bearer ${TEST_ACCESS_TOKEN}`}
                })
            )
        ).rejects.toThrow("No details provided for DeleteDynamoDBClientEntries");
        expect(deleteEntriesSpy).not.toHaveBeenCalled();
    });

    it("calls the dynamo client with a delete command with the expected values and throws an error when the dynamo client throws an error", async () => {
        const error = "SomeAwsError";
        const deleteClientEntriesSpy = jest
            .spyOn(DynamoDbClient.prototype, "deleteDynamoDBClientEntries")
            .mockRejectedValue(new Error(error));

        await expect(
            deleteDynamoDBClientEntriesHandler(
                constructTestApiGatewayEvent({
                    body: JSON.stringify({
                        userId: TEST_USER_ID,
                        serviceId: TEST_SERVICE_ID
                    }),
                    pathParameters: {},
                    headers: {Authorization: `Bearer ${TEST_ACCESS_TOKEN}`}
                })
            )
        ).rejects.toThrow(error);

        expect(deleteClientEntriesSpy).toHaveBeenCalledWith(TEST_USER_ID, TEST_SERVICE_ID);
    });

    it("returns a 403 when there is no service-user relation", async () => {
        const deleteEntriesSpy = jest.spyOn(DynamoDbClient.prototype, "deleteDynamoDBClientEntries").mockResolvedValue();
        const checkServiceUserExistSpy = jest.spyOn(DynamoDbClient.prototype, "checkServiceUserExists").mockResolvedValue(false);

        const serviceHandlerResponse = await deleteDynamoDBClientEntriesHandler(
            constructTestApiGatewayEvent({
                body: JSON.stringify({
                    userId: TEST_USER_ID,
                    serviceId: TEST_SERVICE_ID
                }),
                pathParameters: {},
                headers: {Authorization: `Bearer ${TEST_ACCESS_TOKEN}`}
            })
        );

        expect(checkServiceUserExistSpy).toHaveBeenCalledWith(TEST_SERVICE_ID, TEST_USER_ID);
        expect(deleteEntriesSpy).not.toHaveBeenCalled();
        expect(serviceHandlerResponse).toStrictEqual({
            statusCode: 403,
            body: "Forbidden"
        });
    });

    it("returns a 403 when the userId in the path params does not match the access token", async () => {
        const deleteEntriesSpy = jest.spyOn(DynamoDbClient.prototype, "deleteDynamoDBClientEntries").mockResolvedValue();
        const checkServiceUserExistSpy = jest.spyOn(DynamoDbClient.prototype, "checkServiceUserExists").mockResolvedValue(true);

        const serviceHandlerResponse = await deleteDynamoDBClientEntriesHandler(
            constructTestApiGatewayEvent({
                body: JSON.stringify({
                    userId: TEST_USER_ID + "djnerdjnr34rnjf",
                    serviceId: TEST_SERVICE_ID
                }),
                pathParameters: {},
                headers: {Authorization: `Bearer ${TEST_ACCESS_TOKEN}`}
            })
        );

        expect(checkServiceUserExistSpy).toHaveBeenCalledWith(TEST_SERVICE_ID, TEST_USER_ID);
        expect(deleteEntriesSpy).not.toHaveBeenCalled();
        expect(serviceHandlerResponse).toStrictEqual({
            statusCode: 403,
            body: "Forbidden"
        });
    });
});

describe("deleteDynamoDBServiceEntriesHandler tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("calls the dynamo client with a delete command with the expected values and returns a 200 with the expected response body", async () => {
        const deleteEntriesSpy = jest.spyOn(DynamoDbClient.prototype, "deleteDynamoDBServiceEntries").mockResolvedValue();
        const checkServiceUserExistSpy = jest.spyOn(DynamoDbClient.prototype, "checkServiceUserExists").mockResolvedValue(true);

        const serviceHandlerResponse = await deleteDynamoDBServiceEntriesHandler(
            constructTestApiGatewayEvent({
                body: JSON.stringify({
                    serviceId: TEST_SERVICE_ID
                }),
                pathParameters: {},
                headers: {Authorization: `Bearer ${TEST_ACCESS_TOKEN}`}
            })
        );

        expect(deleteEntriesSpy).toHaveBeenCalledWith(TEST_SERVICE_ID);
        expect(checkServiceUserExistSpy).toHaveBeenCalledWith(TEST_SERVICE_ID, TEST_USER_ID);
        expect(serviceHandlerResponse).toStrictEqual({
            statusCode: 200,
            body: JSON.stringify("")
        });
    });

    it("returns a 403 for no service-user relationship", async () => {
        const deleteEntriesSpy = jest.spyOn(DynamoDbClient.prototype, "deleteDynamoDBServiceEntries").mockResolvedValue();
        const checkServiceUserExistSpy = jest.spyOn(DynamoDbClient.prototype, "checkServiceUserExists").mockResolvedValue(false);

        const serviceHandlerResponse = await deleteDynamoDBServiceEntriesHandler(
            constructTestApiGatewayEvent({
                body: JSON.stringify({
                    serviceId: TEST_SERVICE_ID
                }),
                pathParameters: {},
                headers: {Authorization: `Bearer ${TEST_ACCESS_TOKEN}`}
            })
        );

        expect(deleteEntriesSpy).not.toHaveBeenCalled();
        expect(checkServiceUserExistSpy).toHaveBeenCalledWith(TEST_SERVICE_ID, TEST_USER_ID);
        expect(serviceHandlerResponse).toStrictEqual({
            statusCode: 403,
            body: "Forbidden"
        });
    });

    it("calls the dynamo client with a delete command with the expected values and throws an error when the dynamo client throws an error", async () => {
        const error = "SomeAwsError";
        const deleteEntriesSpy = jest.spyOn(DynamoDbClient.prototype, "deleteDynamoDBServiceEntries").mockRejectedValue(new Error(error));
        const checkServiceUserExistSpy = jest.spyOn(DynamoDbClient.prototype, "checkServiceUserExists").mockResolvedValue(true);

        await expect(
            deleteDynamoDBServiceEntriesHandler(
                constructTestApiGatewayEvent({
                    body: JSON.stringify({
                        serviceId: TEST_SERVICE_ID
                    }),
                    pathParameters: {},
                    headers: {Authorization: `Bearer ${TEST_ACCESS_TOKEN}`}
                })
            )
        ).rejects.toThrow(error);
        expect(deleteEntriesSpy).toHaveBeenCalledWith(TEST_SERVICE_ID);
        expect(checkServiceUserExistSpy).toHaveBeenCalledWith(TEST_SERVICE_ID, TEST_USER_ID);
    });

    it("throws an error when there is no serviceId provided", async () => {
        const deleteEntriesSpy = jest.spyOn(DynamoDbClient.prototype, "deleteDynamoDBServiceEntries").mockResolvedValue();

        await expect(
            deleteDynamoDBServiceEntriesHandler(
                constructTestApiGatewayEvent({
                    body: JSON.stringify({}),
                    pathParameters: {},
                    headers: {Authorization: `Bearer ${TEST_ACCESS_TOKEN}`}
                })
            )
        ).rejects.toThrow("No Service ID provided for DeleteDynamoDBServiceEntries");
        expect(deleteEntriesSpy).not.toHaveBeenCalled();
    });
});
