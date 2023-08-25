const send = jest.fn();
const queryCommand = jest.fn();
const updateItemCommand = jest.fn();

jest.mock("@aws-sdk/client-dynamodb", () => {
    return {
        DynamoDBClient: jest.fn(() => {
            return {
                send: send
            };
        }),
        QueryCommand: queryCommand,
        UpdateItemCommand: updateItemCommand
    };
});

import DynamoDbClient from "dynamodb-client";

const queryCommandParams = {
    TableName: "identities",
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

const updateCommandParams01 = {
    TableName: "identities",
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
    TableName: "identities",
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
            process.env.TABLE = "identities";
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
                "set #services = :services, set #email = :email, set #attempts = :attempts, set #verified = :verified, set #D = :data";

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
