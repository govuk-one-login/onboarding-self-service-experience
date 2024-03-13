import {getServiceClientsHandler} from "../../../src/handlers/dynamodb/get-service-clients";
import DynamoDbClient from "../../../src/dynamodb-client";
import {APIGatewayEventDefaultAuthorizerContext, APIGatewayProxyEvent, APIGatewayProxyEventBase} from "aws-lambda";

const serviceId = "1ded3d65-d088-4319-9431-ea5a3323799d";

function createTestEvent(overrides: Partial<APIGatewayProxyEvent>): APIGatewayProxyEvent {
    return <APIGatewayProxyEventBase<APIGatewayEventDefaultAuthorizerContext>>{
        body: null,
        headers: {},
        // etc.
        ...overrides
    };
}

describe("updateServiceClientHandler tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("calls the dynamo client with a get command with the expected values and returns a 200 with the expected response body", async () => {
        const updateItemSpy = jest.spyOn(DynamoDbClient.prototype, "getClients").mockResolvedValue({
            $metadata: {}
        });

        const updateServiceHandlerResponse = await getServiceClientsHandler(createTestEvent({pathParameters: {serviceId: serviceId}}));

        expect(updateItemSpy).toHaveBeenCalledWith(serviceId);

        expect(updateServiceHandlerResponse).toStrictEqual({
            statusCode: 200,
            body: '{"$metadata":{}}'
        });
    });

    it("calls the dynamo client with a get command with the expected values and returns a 500 when the dynamo client throws an error", async () => {
        const error = "SomeAwsError";
        const updateItemSpy = jest.spyOn(DynamoDbClient.prototype, "getClients").mockRejectedValue(error);

        const updateServiceHandlerResponse = await getServiceClientsHandler(createTestEvent({pathParameters: {serviceId: serviceId}}));

        expect(updateItemSpy).toHaveBeenCalledWith(serviceId);

        expect(updateServiceHandlerResponse).toStrictEqual({
            statusCode: 500,
            body: JSON.stringify(error)
        });
    });

    it("calls the dynamo client with a get command without the expected values and returns a 400 when the dynamo client throws an error", async () => {
        const error = "No userId request parameter supplied";

        const updateServiceHandlerResponse = await getServiceClientsHandler(createTestEvent({}));

        expect(updateServiceHandlerResponse).toStrictEqual({
            statusCode: 400,
            body: JSON.stringify(error)
        });
    });
});
