import {getUserHandler} from "../../../src/handlers/dynamodb/get-user";
import DynamoDbClient from "../../../src/dynamodb-client";
import {APIGatewayEventDefaultAuthorizerContext, APIGatewayProxyEvent, APIGatewayProxyEventBase} from "aws-lambda";
import ResolvedValue = jest.ResolvedValue;

const userId = "user#123";

function createTestEvent(): APIGatewayProxyEvent {
    return <APIGatewayProxyEventBase<APIGatewayEventDefaultAuthorizerContext>>{
        body: '"' + userId + '"',
        headers: {}
    };
}

function createResolvedValue(): ResolvedValue<string> {
    return <ResolvedValue<string>>{
        id: "123",
        fullName: "Jane Jones",
        firstName: "Jane",
        lastName: "Jones",
        email: "jane.jones@test.gov.uk",
        mobileNumber: undefined,
        passwordLastUpdated: "01/01/2024"
    };
}

const resolvedBody =
    '{"id":"123","fullName":"Jane Jones","firstName":"Jane","lastName":"Jones","email":"jane.jones@test.gov.uk","passwordLastUpdated":"01/01/2024"}';

describe("getUserHandler tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("calls the dynamo client with a get command with the expected values and returns a 200 with the expected response body", async () => {
        const itemSpy = jest.spyOn(DynamoDbClient.prototype, "getUser").mockResolvedValue(createResolvedValue());

        const serviceHandlerResponse = await getUserHandler(createTestEvent());

        expect(itemSpy).toHaveBeenCalledWith(userId);

        expect(serviceHandlerResponse).toStrictEqual({
            statusCode: 200,
            body: resolvedBody
        });
    });

    it("calls the dynamo client with a get command with the expected values and returns a 500 when the dynamo client throws an error", async () => {
        const error = "SomeAwsError";
        const itemSpy = jest.spyOn(DynamoDbClient.prototype, "getUser").mockRejectedValue(error);

        const serviceHandlerResponse = await getUserHandler(createTestEvent());

        expect(itemSpy).toHaveBeenCalledWith(userId);

        expect(serviceHandlerResponse).toStrictEqual({
            statusCode: 500,
            body: JSON.stringify(error)
        });
    });
});
