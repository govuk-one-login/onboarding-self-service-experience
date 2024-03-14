import {globalSignOutHandler} from "../../../src/handlers/dynamodb/global-sign-out";
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
        deletedItemCount: 1
    };
}

const resolvedBody = '{"email":"' + userEmail + '","deletedItemCount":1}';

describe("globalSignOutHandler tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("calls the dynamo client with a delete command with the expected values and returns a 200 with the expected response body", async () => {
        const itemSpy = jest.spyOn(DynamoDbClient.prototype, "deleteSessions").mockResolvedValue(createResolvedValue());

        const serviceHandlerResponse = await globalSignOutHandler(createTestEvent({pathParameters: {userEmail: userEmail}}));

        expect(itemSpy).toHaveBeenCalledWith(userEmail);

        expect(serviceHandlerResponse).toStrictEqual({
            statusCode: 200,
            body: resolvedBody
        });
    });

    it("calls the dynamo client with a delete command with the expected values and returns a 500 when the dynamo client throws an error", async () => {
        const error = "SomeAwsError";
        const itemSpy = jest.spyOn(DynamoDbClient.prototype, "deleteSessions").mockRejectedValue(error);

        const serviceHandlerResponse = await globalSignOutHandler(createTestEvent({pathParameters: {userEmail: userEmail}}));

        expect(itemSpy).toHaveBeenCalledWith(userEmail);

        expect(serviceHandlerResponse).toStrictEqual({
            statusCode: 500,
            body: JSON.stringify({errorMessage: error})
        });
    });

    it("calls the dynamo client with a delete command without the expected values and returns a 400 when the dynamo client throws an error", async () => {
        const error = "No userEmail request parameter supplied";

        const serviceHandlerResponse = await globalSignOutHandler(createTestEvent({}));

        expect(serviceHandlerResponse).toStrictEqual({
            statusCode: 400,
            body: JSON.stringify(error)
        });
    });
});
