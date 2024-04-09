import {constructTestApiGatewayEvent} from "../utils";
import {putUserHandler} from "./../../../src/handlers/dynamodb/put-user";
import DynamoDbClient from "../../../src/dynamodb-client";
import {PutItemCommandOutput} from "@aws-sdk/client-dynamodb";
import {TEST_USER_EMAIL, TEST_USER_PHONE_NUMBER} from "../constants";

const TEST_USER = {
    userEmail: TEST_USER_EMAIL,
    phone: TEST_USER_PHONE_NUMBER
};
const TEST_PUT_USER_EVENT = constructTestApiGatewayEvent({
    body: JSON.stringify(TEST_USER),
    pathParameters: {}
});

describe("putUserHandler tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("returns a 200 and the stringified record in the response when the dynamo put is successful", async () => {
        const dynamoPutItemResponse: PutItemCommandOutput = {$metadata: {httpStatusCode: 200}, Attributes: {}};
        const dynamoPutSpy = jest.spyOn(DynamoDbClient.prototype, "put").mockResolvedValue(dynamoPutItemResponse);

        const response = await putUserHandler(TEST_PUT_USER_EVENT);

        expect(dynamoPutSpy).toHaveBeenCalledWith(TEST_USER);
        expect(response).toStrictEqual({
            statusCode: 200,
            body: JSON.stringify(dynamoPutItemResponse)
        });
    });

    it("returns a 500 and a stringified error when the dynamo client throws an error", async () => {
        const dynamoErr = "SomeDynamoError";
        const dynamoPutSpy = jest.spyOn(DynamoDbClient.prototype, "put").mockRejectedValue(dynamoErr);

        const response = await putUserHandler(TEST_PUT_USER_EVENT);

        expect(dynamoPutSpy).toHaveBeenCalledWith(TEST_USER);
        expect(response).toStrictEqual({
            statusCode: 500,
            body: JSON.stringify(dynamoErr)
        });
    });
});
