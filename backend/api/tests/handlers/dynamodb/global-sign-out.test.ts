import {globalSignOutHandler} from "../../../src/handlers/dynamodb/global-sign-out";
import DynamoDbClient from "../../../src/dynamodb-client";
import {constructTestApiGatewayEvent} from "../utils";
import {TEST_USER_EMAIL} from "../constants";

describe("globalSignOutHandler tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("calls the dynamo client with a delete command with the expected values and returns a 200 with the expected response body", async () => {
        const mockDeleteSessionResponse = {deletedItemCount: 3};
        const deleteSessionSpy = jest.spyOn(DynamoDbClient.prototype, "deleteSessions").mockResolvedValue(mockDeleteSessionResponse);

        const serviceHandlerResponse = await globalSignOutHandler(
            constructTestApiGatewayEvent({body: "", pathParameters: {userEmail: TEST_USER_EMAIL}})
        );

        expect(deleteSessionSpy).toHaveBeenCalledWith(TEST_USER_EMAIL);
        expect(serviceHandlerResponse).toStrictEqual({
            statusCode: 200,
            body: JSON.stringify({email: TEST_USER_EMAIL, ...mockDeleteSessionResponse})
        });
    });

    it("calls the dynamo client with a delete command with the expected values and returns a 500 when the dynamo client throws an error", async () => {
        const error = "SomeAwsError";
        const deleteSessionSpy = jest.spyOn(DynamoDbClient.prototype, "deleteSessions").mockRejectedValue(error);

        const serviceHandlerResponse = await globalSignOutHandler(
            constructTestApiGatewayEvent({body: "", pathParameters: {userEmail: TEST_USER_EMAIL}})
        );

        expect(deleteSessionSpy).toHaveBeenCalledWith(TEST_USER_EMAIL);
        expect(serviceHandlerResponse).toStrictEqual({
            statusCode: 500,
            body: JSON.stringify({errorMessage: error})
        });
    });

    it("calls the dynamo client with a delete command without the expected values and returns a 400 when the dynamo client throws an error", async () => {
        const deleteSessionSpy = jest.spyOn(DynamoDbClient.prototype, "deleteSessions");
        const serviceHandlerResponse = await globalSignOutHandler(constructTestApiGatewayEvent());

        expect(deleteSessionSpy).not.toHaveBeenCalled();
        expect(serviceHandlerResponse).toStrictEqual({
            statusCode: 400,
            body: JSON.stringify("No userEmail request parameter supplied")
        });
    });
});
