import {getServicesHandler} from "../../../src/handlers/dynamodb/get-services";
import DynamoDbClient from "../../../src/dynamodb-client";
import {APIGatewayEventDefaultAuthorizerContext, APIGatewayProxyEvent, APIGatewayProxyEventBase} from "aws-lambda";
import ResolvedValue = jest.ResolvedValue;

const userId = "1ded3d65-d088-4319-9431-ea5a3323799d";

function createTestEvent(overrides: Partial<APIGatewayProxyEvent>): APIGatewayProxyEvent {
    return <APIGatewayProxyEventBase<APIGatewayEventDefaultAuthorizerContext>>{
        body: null,
        headers: {},
        // etc.
        ...overrides
    };
}

function createResolvedValue(): ResolvedValue<string> {
    return <ResolvedValue<string>>{
        Service: "MyService"
    };
}

const resolvedBody = '{"Service":"MyService"}';

describe("getServicesHandler tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("calls the dynamo client with a get command with the expected values and returns a 200 with the expected response body", async () => {
        const itemSpy = jest.spyOn(DynamoDbClient.prototype, "getServices").mockResolvedValue(createResolvedValue());

        const serviceHandlerResponse = await getServicesHandler(createTestEvent({pathParameters: {userId: userId}}));

        expect(itemSpy).toHaveBeenCalledWith(userId);

        expect(serviceHandlerResponse).toStrictEqual({
            statusCode: 200,
            body: resolvedBody
        });
    });

    it("calls the dynamo client with a get command with the expected values and returns a 500 when the dynamo client throws an error", async () => {
        const error = "SomeAwsError";
        const itemSpy = jest.spyOn(DynamoDbClient.prototype, "getServices").mockRejectedValue(error);

        const serviceHandlerResponse = await getServicesHandler(createTestEvent({pathParameters: {userId: userId}}));

        expect(itemSpy).toHaveBeenCalledWith(userId);

        expect(serviceHandlerResponse).toStrictEqual({
            statusCode: 500,
            body: JSON.stringify(error)
        });
    });

    it("calls the dynamo client with a get command without the expected values and returns a 400 when the dynamo client throws an error", async () => {
        const error = "No userId request parameter supplied";

        const serviceHandlerResponse = await getServicesHandler(createTestEvent({}));

        expect(serviceHandlerResponse).toStrictEqual({
            statusCode: 400,
            body: JSON.stringify(error)
        });
    });
});
