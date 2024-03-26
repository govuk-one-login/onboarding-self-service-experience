import {updateUserHandler} from "../../../src/handlers/dynamodb/update-user";
import DynamoDbClient from "../../../src/dynamodb-client";
import ResolvedValue = jest.ResolvedValue;

const randomId = "1234Random";
jest.mock("crypto", () => ({
    randomUUID: jest.fn(() => randomId)
}));

const updateUserHandlerBody = {
    updates: {
        serviceName: "New Test Service"
    },
    cognitoUserId: "123",
    userId: "1ded3d65-d088-4319-9431-ea5a3323799d"
};

function createResolvedValue(): ResolvedValue<string> {
    return <ResolvedValue<string>>{
        userId: updateUserHandlerBody.userId,
        cognitoUserId: updateUserHandlerBody.cognitoUserId
    };
}

const resolvedBody = '{"userId":"1ded3d65-d088-4319-9431-ea5a3323799d","cognitoUserId":"123"}';

describe("updateUserHandler tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("calls the dynamo client with a update command with the expected values and returns a 200 with the expected response body", async () => {
        const itemSpy = jest.spyOn(DynamoDbClient.prototype, "updateUser").mockResolvedValue(createResolvedValue());

        const updateServiceHandlerResponse = await updateUserHandler({
            statusCode: 200,
            body: JSON.stringify(updateUserHandlerBody)
        });

        expect(itemSpy).toHaveBeenCalledWith(
            updateUserHandlerBody.userId,
            updateUserHandlerBody.cognitoUserId,
            updateUserHandlerBody.updates
        );

        expect(updateServiceHandlerResponse).toStrictEqual({
            statusCode: 200,
            body: resolvedBody
        });
    });

    it("calls the dynamo client with a update command with the expected values and returns a 500 when the dynamo client throws an error", async () => {
        const error = "SomeAwsError";
        const itemSpy = jest.spyOn(DynamoDbClient.prototype, "updateUser").mockRejectedValue(error);

        const updateServiceHandlerResponse = await updateUserHandler({
            statusCode: 200,
            body: JSON.stringify(updateUserHandlerBody)
        });

        expect(itemSpy).toHaveBeenCalledWith(
            updateUserHandlerBody.userId,
            updateUserHandlerBody.cognitoUserId,
            updateUserHandlerBody.updates
        );

        expect(updateServiceHandlerResponse).toStrictEqual({
            statusCode: 500,
            body: JSON.stringify(error)
        });
    });
});
