import DynamoDbClient from "../../../src/dynamodb-client";
import {TEST_SERVICE_ID, TEST_SERVICE_NAME, TEST_USER_DYNAMO_ID, TEST_USER_EMAIL} from "../constants";
import {constructTestApiGatewayEvent, mockLambdaContext} from "../utils";
import {putServiceUserHandler} from "./../../../src/handlers/dynamodb/put-service-user";
import {PutItemCommandOutput} from "@aws-sdk/client-dynamodb";

const TEST_PUT_USER_PAYLOAD = {
    service: {
        id: TEST_SERVICE_ID,
        serviceName: TEST_SERVICE_NAME
    },
    userEmail: TEST_USER_EMAIL,
    userDynamoId: TEST_USER_DYNAMO_ID
};
const TEST_PUT_USER_INVOKE_EVENT = constructTestApiGatewayEvent({body: JSON.stringify(TEST_PUT_USER_PAYLOAD), pathParameters: {}});

const TEST_SERVICE_USER_RECORD = {
    pk: TEST_SERVICE_ID,
    sk: `user#${TEST_USER_DYNAMO_ID}`,
    data: TEST_USER_EMAIL,
    role: "admin",
    service_name: TEST_SERVICE_NAME
};

describe("putServiceUser tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("returns a 200 and the stringified record in the response when the dynamo put is successful", async () => {
        const dynamoPutItemResponse: PutItemCommandOutput = {$metadata: {httpStatusCode: 200}, Attributes: {}};
        const dynamoPutSpy = jest.spyOn(DynamoDbClient.prototype, "put").mockResolvedValue(dynamoPutItemResponse);

        const response = await putServiceUserHandler(TEST_PUT_USER_INVOKE_EVENT, mockLambdaContext);
        expect(dynamoPutSpy).toHaveBeenCalledWith(TEST_SERVICE_USER_RECORD);
        expect(response).toStrictEqual({
            statusCode: 200,
            body: JSON.stringify(TEST_SERVICE_USER_RECORD)
        });
    });

    it("returns a 500 and a stringified error when the dynamo client throws", async () => {
        const dynamoErr = "SomeDynamoError";
        const dynamoPutSpy = jest.spyOn(DynamoDbClient.prototype, "put").mockRejectedValue(dynamoErr);

        const response = await putServiceUserHandler(TEST_PUT_USER_INVOKE_EVENT, mockLambdaContext);
        expect(dynamoPutSpy).toHaveBeenCalledWith(TEST_SERVICE_USER_RECORD);
        expect(response).toStrictEqual({
            statusCode: 500,
            body: JSON.stringify(dynamoErr)
        });
    });
});
