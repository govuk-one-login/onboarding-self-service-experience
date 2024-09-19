import {updateUserHandler} from "../../../src/handlers/dynamodb/update-user";
import DynamoDbClient from "../../../src/dynamodb-client";
import {TEST_ACCESS_TOKEN, TEST_COGNITO_USER_ID, TEST_SERVICE_NAME, TEST_USER_ID, TEST_USER_PHONE_NUMBER} from "../constants";
import {UpdateItemCommandOutput} from "@aws-sdk/client-dynamodb";
import {constructTestApiGatewayEvent} from "../utils";

const TEST_USER_UPDATES = {
    userId: TEST_USER_ID,
    updates: {
        phone: TEST_USER_PHONE_NUMBER
    }
};
describe("updateUserHandler tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("returns a  400 for no UserId in the update body", async () => {
        const updateUserResponse: UpdateItemCommandOutput = {$metadata: {httpStatusCode: 200}};
        const updateUserSpy = jest.spyOn(DynamoDbClient.prototype, "updateUser").mockResolvedValue(updateUserResponse);

        const response = await updateUserHandler(
            constructTestApiGatewayEvent({
                body: JSON.stringify({
                    cognitoUserId: TEST_COGNITO_USER_ID,
                    updates: {
                        serviceName: TEST_SERVICE_NAME
                    }
                }),
                pathParameters: {}
            })
        );

        expect(updateUserSpy).not.toHaveBeenCalled();
        expect(response).toStrictEqual({
            statusCode: 400,
            body: "No userId provided in request body"
        });
    });

    it("returns a 403 if the userId in the request body does not match the access token", async () => {
        const updateUserResponse: UpdateItemCommandOutput = {$metadata: {httpStatusCode: 200}};
        const updateUserSpy = jest.spyOn(DynamoDbClient.prototype, "updateUser").mockResolvedValue(updateUserResponse);

        const response = await updateUserHandler(
            constructTestApiGatewayEvent({
                body: JSON.stringify({
                    cognitoUserId: TEST_COGNITO_USER_ID,
                    updates: {
                        serviceId: "aDifferentUserId",
                        serviceName: TEST_SERVICE_NAME
                    }
                }),
                pathParameters: {},
                headers: {Authorization: `Bearer ${TEST_ACCESS_TOKEN}`}
            })
        );

        expect(updateUserSpy).not.toHaveBeenCalled();
        expect(response).toStrictEqual({
            statusCode: 400,
            body: "No userId provided in request body"
        });
    });

    it("returns a 200 and the stringified record in the response when the update is successful", async () => {
        const updateUserResponse: UpdateItemCommandOutput = {$metadata: {httpStatusCode: 200}};
        const updateUserSpy = jest.spyOn(DynamoDbClient.prototype, "updateUser").mockResolvedValue(updateUserResponse);

        const response = await updateUserHandler(
            constructTestApiGatewayEvent({
                body: JSON.stringify(TEST_USER_UPDATES),
                pathParameters: {},
                headers: {Authorization: `Bearer ${TEST_ACCESS_TOKEN}`}
            })
        );

        expect(updateUserSpy).toHaveBeenCalledWith(TEST_USER_ID, {
            phone: TEST_USER_PHONE_NUMBER
        });
        expect(response).toStrictEqual({
            statusCode: 200,
            body: JSON.stringify(updateUserResponse)
        });
    });

    it("returns a 500 and a stringified error when the dynamo client throws", async () => {
        const dynamoErr = "SomeDynamoErr";
        const updateUserSpy = jest.spyOn(DynamoDbClient.prototype, "updateUser").mockRejectedValue(dynamoErr);

        const response = await updateUserHandler(
            constructTestApiGatewayEvent({
                body: JSON.stringify(TEST_USER_UPDATES),
                pathParameters: {},
                headers: {Authorization: `Bearer ${TEST_ACCESS_TOKEN}`}
            })
        );

        expect(updateUserSpy).toHaveBeenCalledWith(TEST_USER_UPDATES.userId, TEST_USER_UPDATES.updates);
        expect(response).toStrictEqual({
            statusCode: 500,
            body: JSON.stringify(dynamoErr)
        });
    });
});
