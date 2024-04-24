import {updateUserHandler} from "../../../src/handlers/dynamodb/update-user";
import DynamoDbClient from "../../../src/dynamodb-client";
import {TEST_COGNITO_USER_ID, TEST_SERVICE_NAME, TEST_USER_ID} from "../constants";
import {UpdateItemCommandOutput} from "@aws-sdk/client-dynamodb";
import {handlerInvokeEvent} from "../../../src/handlers/handler-utils";

const TEST_USER_UPDATES = {
    userId: TEST_USER_ID,
    cognitoUserId: TEST_COGNITO_USER_ID,
    updates: {
        serviceName: TEST_SERVICE_NAME
    }
};

const TEST_UPDATE_USER_EVENT: handlerInvokeEvent = {
    statusCode: 200,
    body: JSON.stringify(TEST_USER_UPDATES)
};

describe("handlerName tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("returns a 200 and the stringified record in the response when the update is successful", async () => {
        const updateUserResponse: UpdateItemCommandOutput = {$metadata: {httpStatusCode: 200}};
        const updateUserSpy = jest.spyOn(DynamoDbClient.prototype, "updateUser").mockResolvedValue(updateUserResponse);

        const response = await updateUserHandler(TEST_UPDATE_USER_EVENT);

        expect(updateUserSpy).toHaveBeenCalledWith(TEST_USER_UPDATES.userId, TEST_USER_UPDATES.cognitoUserId, TEST_USER_UPDATES.updates);
        expect(response).toStrictEqual({
            statusCode: 200,
            body: JSON.stringify(updateUserResponse)
        });
    });

    it("returns a 500 and a stringified error when the dynamo client throws", async () => {
        const dynamoErr = "SomeDynamoErr";
        const updateUserSpy = jest.spyOn(DynamoDbClient.prototype, "updateUser").mockRejectedValue(dynamoErr);

        const response = await updateUserHandler(TEST_UPDATE_USER_EVENT);

        expect(updateUserSpy).toHaveBeenCalledWith(TEST_USER_UPDATES.userId, TEST_USER_UPDATES.cognitoUserId, TEST_USER_UPDATES.updates);
        expect(response).toStrictEqual({
            statusCode: 500,
            body: JSON.stringify(dynamoErr)
        });
    });
});
