import {getUserHandler} from "../../../src/handlers/dynamodb/get-user";
import DynamoDbClient from "../../../src/dynamodb-client";
import {constructTestApiGatewayEvent} from "../utils";
import {TEST_COGNITO_USER_ID, TEST_USER_CONFIG} from "../constants";
import {GetItemCommandOutput} from "@aws-sdk/client-dynamodb";

describe("getUserHandler tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("calls the dynamo client with a get command with the expected values and returns a 200 with the expected response body", async () => {
        const testGetUserResponse: GetItemCommandOutput = {$metadata: {}, Item: TEST_USER_CONFIG};

        const getUserSpy = jest.spyOn(DynamoDbClient.prototype, "getUser").mockResolvedValue(testGetUserResponse);
        const serviceHandlerResponse = await getUserHandler(
            constructTestApiGatewayEvent({body: JSON.stringify(TEST_COGNITO_USER_ID), pathParameters: {}})
        );

        expect(getUserSpy).toHaveBeenCalledWith(TEST_COGNITO_USER_ID);
        expect(serviceHandlerResponse).toStrictEqual({
            statusCode: 200,
            body: JSON.stringify(testGetUserResponse)
        });
    });

    it("calls the dynamo client with a get command with the expected values and returns a 500 when the dynamo client throws an error", async () => {
        const error = "SomeAwsError";
        const getUserSpy = jest.spyOn(DynamoDbClient.prototype, "getUser").mockRejectedValue(error);

        const serviceHandlerResponse = await getUserHandler(
            constructTestApiGatewayEvent({body: JSON.stringify(TEST_COGNITO_USER_ID), pathParameters: {}})
        );

        expect(getUserSpy).toHaveBeenCalledWith(TEST_COGNITO_USER_ID);
        expect(serviceHandlerResponse).toStrictEqual({
            statusCode: 500,
            body: JSON.stringify(error)
        });
    });
});
