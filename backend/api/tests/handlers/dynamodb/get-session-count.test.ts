import {getSessionCountHandler} from "../../../src/handlers/dynamodb/get-session-count";
import DynamoDbClient from "../../../src/dynamodb-client";
import {APIGatewayEventDefaultAuthorizerContext, APIGatewayProxyEvent, APIGatewayProxyEventBase} from "aws-lambda";
import ResolvedValue = jest.ResolvedValue;

const userEmail = "test@test.gov.uk";

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
        Count: "0"
    };
}

const resolvedBody = '{"email":"test@test.gov.uk","sessionCount":"0"}';

describe("getSessionCountHandler tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("calls the dynamo client with a get command with the expected values and returns a 200 with the expected response body", async () => {
        const itemSpy = jest.spyOn(DynamoDbClient.prototype, "getSessions").mockResolvedValue(createResolvedValue());

        const serviceHandlerResponse = await getSessionCountHandler(createTestEvent({pathParameters: {userEmail: userEmail}}));

        expect(itemSpy).toHaveBeenCalledWith(userEmail);

        expect(serviceHandlerResponse).toStrictEqual({
            statusCode: 200,
            body: resolvedBody
        });
    });

    it("calls the dynamo client with a get command with the expected values and returns a 500 when the dynamo client throws an error", async () => {
        const error = '{"errorMessage":"SomeAwsError"}';
        const itemSpy = jest.spyOn(DynamoDbClient.prototype, "getSessions").mockRejectedValue("SomeAwsError");

        const serviceHandlerResponse = await getSessionCountHandler(createTestEvent({pathParameters: {userEmail: userEmail}}));

        expect(itemSpy).toHaveBeenCalledWith(userEmail);

        expect(serviceHandlerResponse).toStrictEqual({
            statusCode: 500,
            body: error
        });
    });

    it("calls the dynamo client with a get command without the expected values and returns a 400 when the dynamo client throws an error", async () => {
        const error = "No userEmail request parameter supplied";

        const serviceHandlerResponse = await getSessionCountHandler(createTestEvent({}));

        expect(serviceHandlerResponse).toStrictEqual({
            statusCode: 400,
            body: JSON.stringify(error)
        });
    });
});
