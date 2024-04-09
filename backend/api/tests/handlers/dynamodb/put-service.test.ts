import {putServiceHandler} from "../../../src/handlers/dynamodb/put-service";
import DynamoDbClient from "../../../src/dynamodb-client";
import {PutItemCommandOutput} from "@aws-sdk/client-dynamodb";
import {TEST_SERVICE_ID, TEST_SERVICE_NAME} from "../constants";
import {handlerInvokeEvent} from "../../../src/handlers/handler-utils";

const TEST_PUT_SERVICE_PAYLOAD = {
    service: {
        id: TEST_SERVICE_ID,
        serviceName: TEST_SERVICE_NAME
    }
};

const TEST_PUT_SERVICE_EVENT: handlerInvokeEvent = {
    statusCode: 200,
    body: JSON.stringify(TEST_PUT_SERVICE_PAYLOAD)
};

const TEST_SERVICE_RECORD = {
    pk: TEST_SERVICE_ID,
    sk: TEST_SERVICE_ID,
    data: TEST_SERVICE_NAME,
    service_name: TEST_SERVICE_NAME
};

describe("putServiceHandler tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("returns a 200 and the stringified record in the response when the dynamo put is successful", async () => {
        const dynamoPutItemResponse: PutItemCommandOutput = {$metadata: {httpStatusCode: 200}, Attributes: {}};
        const dynamoPutSpy = jest.spyOn(DynamoDbClient.prototype, "put").mockResolvedValue(dynamoPutItemResponse);

        const response = await putServiceHandler(TEST_PUT_SERVICE_EVENT);

        expect(dynamoPutSpy).toHaveBeenCalledWith(TEST_SERVICE_RECORD);
        expect(response).toStrictEqual({
            statusCode: 200,
            body: JSON.stringify(dynamoPutItemResponse)
        });
    });

    it("returns a 500 and a stringified error when the dynamo client throws an error", async () => {
        const dynamoErr = "SomeDynamoError";
        const dynamoPutSpy = jest.spyOn(DynamoDbClient.prototype, "put").mockRejectedValue(dynamoErr);

        const response = await putServiceHandler(TEST_PUT_SERVICE_EVENT);

        expect(dynamoPutSpy).toHaveBeenCalledWith(TEST_SERVICE_RECORD);
        expect(response).toStrictEqual({
            statusCode: 500,
            body: JSON.stringify(dynamoErr)
        });
    });
});
