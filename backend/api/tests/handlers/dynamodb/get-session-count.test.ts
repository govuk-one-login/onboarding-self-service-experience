import {getSessionCountHandler} from "../../../src/handlers/dynamodb/get-session-count";
import DynamoDbClient from "../../../src/dynamodb-client";
import {ScanCommandOutput} from "@aws-sdk/client-dynamodb";
import {constructTestApiGatewayEvent} from "../utils";
import {TEST_USER_EMAIL} from "../constants";

describe("getSessionCountHandler tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("calls the dynamo client with a get command with the expected values and returns a 200 with the expected response body", async () => {
        const dynamoResponse: ScanCommandOutput = {$metadata: {}, Count: 1};
        const getSessionsSpy = jest.spyOn(DynamoDbClient.prototype, "getSessions").mockResolvedValue(dynamoResponse);

        const testApiGatewayEvent = constructTestApiGatewayEvent({
            body: "",
            pathParameters: {
                userEmail: TEST_USER_EMAIL
            }
        });
        const serviceHandlerResponse = await getSessionCountHandler(testApiGatewayEvent);

        expect(getSessionsSpy).toHaveBeenCalledWith(TEST_USER_EMAIL);

        expect(serviceHandlerResponse).toStrictEqual({
            statusCode: 200,
            body: JSON.stringify({email: TEST_USER_EMAIL, sessionCount: 1})
        });
    });

    it("calls the dynamo client with a get command with the expected values and returns a 500 when the dynamo client throws an error", async () => {
        const error = "SomeAwsError";
        const getSessionsSpy = jest.spyOn(DynamoDbClient.prototype, "getSessions").mockRejectedValue(error);

        const testApiGatewayEvent = constructTestApiGatewayEvent({
            body: "",
            pathParameters: {
                userEmail: TEST_USER_EMAIL
            }
        });
        const serviceHandlerResponse = await getSessionCountHandler(testApiGatewayEvent);

        expect(getSessionsSpy).toHaveBeenCalledWith(TEST_USER_EMAIL);

        expect(serviceHandlerResponse).toStrictEqual({
            statusCode: 500,
            body: JSON.stringify({errorMessage: error})
        });
    });

    it("Returns a 400 and does not call the dynamo client when there is no userEmail Path Parameter", async () => {
        const getSessionsSpy = jest.spyOn(DynamoDbClient.prototype, "getSessions").mockResolvedValue({$metadata: {}});
        const serviceHandlerResponse = await getSessionCountHandler(constructTestApiGatewayEvent());
        expect(serviceHandlerResponse).toStrictEqual({
            statusCode: 400,
            body: JSON.stringify("No userEmail request parameter supplied")
        });
        expect(getSessionsSpy).not.toHaveBeenCalled();
    });
});
