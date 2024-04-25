import {getServicesHandler} from "../../../src/handlers/dynamodb/get-services";
import DynamoDbClient from "../../../src/dynamodb-client";
import {constructTestApiGatewayEvent} from "../utils";
import {GetItemCommandOutput} from "@aws-sdk/client-dynamodb";
import {TEST_USER_ID} from "../constants";

describe("getServicesHandler tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("calls the dynamo client with a get command with the expected values and returns a 200 with the expected response body", async () => {
        const mockDynamoResponse: GetItemCommandOutput = {
            $metadata: {}
        };
        const getServicesSpy = jest.spyOn(DynamoDbClient.prototype, "getServices").mockResolvedValue(mockDynamoResponse);

        const testApiGatewayEvent = constructTestApiGatewayEvent({body: "", pathParameters: {userId: TEST_USER_ID}});
        const serviceHandlerResponse = await getServicesHandler(testApiGatewayEvent);

        expect(getServicesSpy).toHaveBeenCalledWith(TEST_USER_ID);

        expect(serviceHandlerResponse).toStrictEqual({
            statusCode: 200,
            body: JSON.stringify(mockDynamoResponse)
        });
    });

    it("calls the dynamo client with a get command with the expected values and returns a 500 when the dynamo client throws an error", async () => {
        const error = "SomeAwsError";
        const getServicesSpy = jest.spyOn(DynamoDbClient.prototype, "getServices").mockRejectedValue(error);

        const testApiGatewayEvent = constructTestApiGatewayEvent({body: "", pathParameters: {userId: TEST_USER_ID}});
        const serviceHandlerResponse = await getServicesHandler(testApiGatewayEvent);
        expect(getServicesSpy).toHaveBeenCalledWith(TEST_USER_ID);

        expect(serviceHandlerResponse).toStrictEqual({
            statusCode: 500,
            body: JSON.stringify(error)
        });
    });

    it("returns a 400 when there is no userId Path parameter and does not call the dynamo client", async () => {
        const error = "No userId request parameter supplied";
        const serviceHandlerResponse = await getServicesHandler(constructTestApiGatewayEvent());
        expect(serviceHandlerResponse).toStrictEqual({
            statusCode: 400,
            body: JSON.stringify(error)
        });
    });
});
