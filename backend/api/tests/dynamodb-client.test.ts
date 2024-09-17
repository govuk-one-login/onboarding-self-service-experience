const send = jest.fn();
const queryCommand = jest.fn();
const scanCommand = jest.fn();
const updateItemCommand = jest.fn();
const deleteItemCommand = jest.fn();

jest.mock("@aws-sdk/client-dynamodb", () => {
    return {
        DynamoDBClient: jest.fn(() => {
            return {
                send: send
            };
        }),
        QueryCommand: queryCommand,
        ScanCommand: scanCommand,
        UpdateItemCommand: updateItemCommand,
        DeleteItemCommand: deleteItemCommand
    };
});

import DynamoDbClient from "../src/dynamodb-client";
import {TEST_DYNAMO_TABLE_NAME} from "./setup";

const queryCommandParams = {
    TableName: TEST_DYNAMO_TABLE_NAME,
    ExpressionAttributeNames: {
        "#serviceId": "pk"
    },
    ExpressionAttributeValues: {
        ":serviceId": {
            S: "service#423423ada-32123892"
        }
    },
    KeyConditionExpression: "#serviceId = :serviceId"
};

const scanCommandParams = {
    TableName: TEST_DYNAMO_TABLE_NAME,
    ExpressionAttributeNames: {
        "#userEmail": "id"
    },
    ExpressionAttributeValues: {
        ":userEmail": {
            S: "97dfebf4098c0f5c16bca61e2b76c373:"
        }
    },
    FilterExpression: "begins_with(#userEmail, :userEmail)",
    ProjectionExpression: "id"
};

const updateCommandParams01 = {
    TableName: TEST_DYNAMO_TABLE_NAME,
    Key: {
        pk: "pk-01",
        sk: "sk-01"
    },
    UpdateExpression: "set #service_name = :service_name",
    ExpressionAttributeNames: {
        "#service_name": "service_name"
    },
    ExpressionAttributeValues: {
        ":service_name": {
            S: "New service name"
        }
    },
    ReturnValues: "ALL_NEW"
};

const updateCommandParams02 = {
    TableName: TEST_DYNAMO_TABLE_NAME,
    Key: {
        pk: "pk-02",
        sk: "sk-02"
    },
    UpdateExpression: "set #service_name = :service_name",
    ExpressionAttributeNames: {
        "#service_name": "service_name"
    },
    ExpressionAttributeValues: {
        ":service_name": {
            S: "New service name"
        }
    },
    ReturnValues: "ALL_NEW"
};

describe("DynamoDB client", () => {
    describe("table name not set", () => {
        delete process.env.TABLE;
        it("should throw if table name not provided", () => {
            expect(() => new DynamoDbClient()).toThrow("Table name");
        });
    });

    describe("table name is set", () => {
        let client: DynamoDbClient;

        const updates = {
            services: ["Juggling license", "Unicorn registration"],
            email: "name@gov.uk",
            attempts: 10,
            verified: true,
            data: "Tessa Ting"
        };

        beforeAll(() => {
            process.env.TABLE = TEST_DYNAMO_TABLE_NAME;
            client = new DynamoDbClient();
        });

        it("should generate correct expression attribute names", () => {
            const generatedExpressionAttributeNames = client.generateExpressionAttributeNames(Object.keys(updates));
            const expectedExpressionAttributeNames = {
                "#services": "services",
                "#email": "email",
                "#attempts": "attempts",
                "#verified": "verified",
                "#D": "data"
            };

            expect(generatedExpressionAttributeNames).toStrictEqual(expectedExpressionAttributeNames);
        });

        it("should generate correct update expression", () => {
            const updateExpression = client.generateUpdateExpression(Object.keys(updates));
            const expectedUpdateExpression =
                "set #services = :services, #email = :email, #attempts = :attempts, #verified = :verified, #D = :data";

            expect(updateExpression).toEqual(expectedUpdateExpression);
        });

        it("should correctly generate attribute values for an update expression", () => {
            const attributeValues = client.generateExpressionAttributeValues(Object.keys(updates), updates);
            const expectedAttributeValues = {
                ":services": {L: [{S: "Juggling license"}, {S: "Unicorn registration"}]},
                ":email": {S: "name@gov.uk"},
                ":attempts": {N: "10"},
                ":verified": {BOOL: true},
                ":data": {S: "Tessa Ting"}
            };

            expect(attributeValues).toStrictEqual(expectedAttributeValues);
        });

        it("should invoke getServicesById successfully", async () => {
            await client.getServicesById("423423ada-32123892");
            expect(queryCommand).toBeCalledTimes(1);
            expect(queryCommand.mock.calls[0][0]).toStrictEqual(queryCommandParams);
            expect(send).toBeCalledTimes(1);
        });

        it("should invoke getSessions successfully", async () => {
            await client.getSessions("test@mail.com");
            expect(scanCommand).toBeCalledTimes(1);
            expect(scanCommand.mock.calls[0][0]).toStrictEqual(scanCommandParams);
            expect(send).toBeCalledTimes(1);
        });

        it("should invoke deleteSessions successfully", async () => {
            await client.deleteSessions("test@mail.com");
            expect(scanCommand).toBeCalledTimes(1);
            expect(scanCommand.mock.calls[0][0]).toStrictEqual(scanCommandParams);
            expect(send).toBeCalledTimes(1);
        });

        it("should invoke getClients successfully", async () => {
            await client.getClients("423423ada-32123892");
            expect(send).toBeCalledTimes(1);
        });

        it("should invoke updateClient successfully", async () => {
            await client.updateClient("423423ada-32123892", "c-id-0001", {Name: "Robert"});
            expect(updateItemCommand).toBeCalledTimes(1);
        });

        it("should invoke updateUser successfully", async () => {
            await client.updateUser("423423ada-32123892", {Name: "Robert"});
            expect(updateItemCommand).toBeCalledTimes(1);
        });

        it("should invoke getListOfClients successfully", async () => {
            await client.getListOfClients();
            expect(send).toBeCalledTimes(1);
        });

        it("should invoke deleteDynamoDBClientEntries successfully", async () => {
            await client.deleteDynamoDBClientEntries("c-id-0001", "423423ada-32123892");
            expect(deleteItemCommand).toBeCalledTimes(2);
            expect(send).toBeCalledTimes(2);
        });

        it("should invoke deleteDynamoDBServiceEntries successfully", async () => {
            await client.deleteDynamoDBServiceEntries("423423ada-32123892");
            expect(send).toBeCalledTimes(1);
        });

        it("should update all records", async () => {
            send.mockImplementation(() => {
                return {
                    Items: [
                        {pk: "pk-01", sk: "sk-01"},
                        {pk: "pk-02", sk: "sk-02"}
                    ]
                };
            });
            const queryCommandOutput = await client.updateService("423423ada-32123892", {service_name: "New service name"});
            expect(send).toBeCalledTimes(3);
            expect(queryCommand.mock.calls[0][0]).toStrictEqual(queryCommandParams);
            expect(updateItemCommand.mock.calls[0][0]).toStrictEqual(updateCommandParams01);
            expect(updateItemCommand.mock.calls[1][0]).toStrictEqual(updateCommandParams02);
            expect(queryCommandOutput.message).toBe("All records updated successfully");
        });
    });
});
