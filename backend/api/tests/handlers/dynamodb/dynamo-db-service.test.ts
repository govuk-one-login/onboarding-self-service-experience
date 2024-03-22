import {
    deleteDynamoDBClientEntriesHandler,
    deleteDynamoDBServiceEntriesHandler,
    getDynamoDBEntriesHandler
} from "../../../src/handlers/dynamodb/dynamo-db-service";
import DynamoDbClient from "../../../src/dynamodb-client";
import {constructTestApiGatewayEvent} from "../utils";
import {TEST_DATA_TABLE_ITEM, TEST_SERVICE_ID, TEST_USER_EMAIL, TEST_USER_ID} from "../constants";

describe("getDynamoDBEntriesHandler tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("calls the getListOfClients and returns the client which includes the userEmail specified in the path params", async () => {
        const getListOfItemsSpy = jest
            .spyOn(DynamoDbClient.prototype, "getListOfClients")
            .mockResolvedValue({Items: [TEST_DATA_TABLE_ITEM], $metadata: {httpStatusCode: 200}});

        const serviceHandlerResponse = await getDynamoDBEntriesHandler(
            constructTestApiGatewayEvent({body: "", pathParameters: {userEmail: TEST_USER_EMAIL}})
        );

        expect(getListOfItemsSpy).toBeCalledTimes(1);
        expect(serviceHandlerResponse).toStrictEqual({
            statusCode: 200,
            body: JSON.stringify(TEST_DATA_TABLE_ITEM)
        });
    });

    it("calls the dynamo client with a scan command with the expected values and throws an error when the dynamo client throws an error", async () => {
        const error = "SomeAwsError";
        const getListOfItemsSpy = jest.spyOn(DynamoDbClient.prototype, "getListOfClients").mockRejectedValue(new Error(error));
        const testEvent = constructTestApiGatewayEvent({body: "", pathParameters: {userEmail: TEST_USER_EMAIL}});

        await expect(getDynamoDBEntriesHandler(testEvent)).rejects.toThrowError(error);
        expect(getListOfItemsSpy).toBeCalledTimes(1);
    });

    it("throws an error if there is no userEmail pathParameter", async () => {
        const getListOfItemsSpy = jest
            .spyOn(DynamoDbClient.prototype, "getListOfClients")
            .mockResolvedValue({Items: [TEST_DATA_TABLE_ITEM], $metadata: {httpStatusCode: 200}});

        await expect(getDynamoDBEntriesHandler(constructTestApiGatewayEvent())).rejects.toThrowError(
            "Unable to check DynamoDB for Items of User Email =>" + undefined
        );
        expect(getListOfItemsSpy).toBeCalledTimes(1);
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
            constructTestApiGatewayEvent({body: "", pathParameters: {userEmail: TEST_USER_EMAIL}})
        );

        expect(getListOfItemsSpy).toBeCalledTimes(1);
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

        const serviceHandlerResponse = await deleteDynamoDBClientEntriesHandler(
            constructTestApiGatewayEvent({
                body: JSON.stringify({
                    userId: TEST_USER_ID,
                    serviceId: TEST_SERVICE_ID
                }),
                pathParameters: {}
            })
        );

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
                    pathParameters: {}
                })
            )
        ).rejects.toThrowError("No details provided for DeleteDynamoDBClientEntries");
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
                    pathParameters: {}
                })
            )
        ).rejects.toThrowError("No details provided for DeleteDynamoDBClientEntries");
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
                    pathParameters: {}
                })
            )
        ).rejects.toThrowError(error);

        expect(deleteClientEntriesSpy).toHaveBeenCalledWith(TEST_USER_ID, TEST_SERVICE_ID);
    });
});

describe("deleteDynamoDBServiceEntriesHandler tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("calls the dynamo client with a delete command with the expected values and returns a 200 with the expected response body", async () => {
        const deleteEntriesSpy = jest.spyOn(DynamoDbClient.prototype, "deleteDynamoDBServiceEntries").mockResolvedValue();

        const serviceHandlerResponse = await deleteDynamoDBServiceEntriesHandler(
            constructTestApiGatewayEvent({
                body: JSON.stringify({
                    serviceId: TEST_SERVICE_ID
                }),
                pathParameters: {}
            })
        );

        expect(deleteEntriesSpy).toHaveBeenCalledWith(TEST_SERVICE_ID);
        expect(serviceHandlerResponse).toStrictEqual({
            statusCode: 200,
            body: JSON.stringify("")
        });
    });

    it("calls the dynamo client with a delete command with the expected values and throws an error when the dynamo client throws an error", async () => {
        const error = "SomeAwsError";
        const deleteEntriesSpy = jest.spyOn(DynamoDbClient.prototype, "deleteDynamoDBServiceEntries").mockRejectedValue(new Error(error));

        await expect(
            deleteDynamoDBServiceEntriesHandler(
                constructTestApiGatewayEvent({
                    body: JSON.stringify({
                        serviceId: TEST_SERVICE_ID
                    }),
                    pathParameters: {}
                })
            )
        ).rejects.toThrowError(error);
        expect(deleteEntriesSpy).toHaveBeenCalledWith(TEST_SERVICE_ID);
    });

    it("throws an error when there is no serviceId provided", async () => {
        const deleteEntriesSpy = jest.spyOn(DynamoDbClient.prototype, "deleteDynamoDBServiceEntries").mockResolvedValue();

        await expect(deleteDynamoDBServiceEntriesHandler(constructTestApiGatewayEvent())).rejects.toThrowError(
            "No Service ID provided for DeleteDynamoDBServiceEntries"
        );
        expect(deleteEntriesSpy).not.toHaveBeenCalled();
    });
});
