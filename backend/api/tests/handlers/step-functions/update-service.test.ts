const validateAuthorisationHeaderMock = jest.fn();

jest.mock("../../../src/handlers/helper/validate-authorisation-header", () => ({
    validateAuthorisationHeader: validateAuthorisationHeaderMock
}));

import {SFNClient, StartSyncExecutionCommand, SyncExecutionStatus} from "@aws-sdk/client-sfn";
import {mockClient} from "aws-sdk-client-mock";
import {constructTestApiGatewayEvent, mockLambdaContext} from "../utils";
import {doUpdateServiceHandler, UpdateServiceBody} from "../../../src/handlers/step-functions/update-service";
import {TEST_CLIENT_ID, TEST_SELF_SERVICE_CLIENT_ID, TEST_SERVICE_ID, TEST_USER_EMAIL, TEST_USER_ID} from "../constants";
import {TEST_STATE_MACHINE_ARN} from "../../setup";
import "aws-sdk-client-mock-jest";

import DynamoDbClient from "../../../src/dynamodb-client";

const checkServiceUserExistsSpy = jest.spyOn(DynamoDbClient.prototype, "checkServiceUserExists");

const TEST_UPDATE_SERVICE: UpdateServiceBody = {
    serviceId: TEST_SERVICE_ID,
    selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
    clientId: TEST_CLIENT_ID,
    updates: {
        contactEmail: TEST_USER_EMAIL
    }
};
const TEST_UPDATE_CLIENT_EVENT = constructTestApiGatewayEvent({
    body: JSON.stringify(TEST_UPDATE_SERVICE),
    pathParameters: {}
});
const mockSfnClient = mockClient(SFNClient);

describe("newClientHandler tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSfnClient.reset();
        validateAuthorisationHeaderMock.mockReturnValue({
            valid: true,
            userId: TEST_USER_ID
        });
        checkServiceUserExistsSpy.mockResolvedValue(true);
    });

    it("returns a 200 for a successful state machine invoke", async () => {
        const mockSfnResponse = {
            status: SyncExecutionStatus.SUCCEEDED,
            $metadata: {httpStatusCode: 200},
            executionArn: TEST_STATE_MACHINE_ARN
        };
        mockSfnClient.on(StartSyncExecutionCommand).resolves(mockSfnResponse);

        const newClientResponse = await doUpdateServiceHandler(TEST_UPDATE_CLIENT_EVENT, mockLambdaContext);

        expect(mockSfnClient).toHaveReceivedCommandWith(StartSyncExecutionCommand, {
            input: JSON.stringify(TEST_UPDATE_SERVICE),
            stateMachineArn: TEST_STATE_MACHINE_ARN
        });

        expect(newClientResponse).toStrictEqual({
            statusCode: 200,
            body: JSON.stringify(mockSfnResponse)
        });
    });

    it("returns a 408 and time out result body if the function execution status is TIMED_OUT", async () => {
        mockSfnClient.on(StartSyncExecutionCommand).resolves({
            status: SyncExecutionStatus.TIMED_OUT,
            $metadata: {httpStatusCode: 408},
            executionArn: TEST_STATE_MACHINE_ARN
        });

        const newClientResponse = await doUpdateServiceHandler(TEST_UPDATE_CLIENT_EVENT, mockLambdaContext);

        expect(mockSfnClient).toHaveReceivedCommandWith(StartSyncExecutionCommand, {
            input: JSON.stringify(TEST_UPDATE_SERVICE),
            stateMachineArn: TEST_STATE_MACHINE_ARN
        });

        expect(newClientResponse).toStrictEqual({
            statusCode: 408,
            body: "Function timed out"
        });
    });

    it("returns a 400 for all non timeout errors and returns the error and cause in the body", async () => {
        const stateMachineError = "Invalid JSON";
        const stateMachineErrorCause = "Payload";

        mockSfnClient.on(StartSyncExecutionCommand).resolves({
            status: SyncExecutionStatus.FAILED,
            $metadata: {httpStatusCode: 400},
            executionArn: TEST_STATE_MACHINE_ARN,
            error: stateMachineError,
            cause: stateMachineErrorCause
        });

        const newClientResponse = await doUpdateServiceHandler(TEST_UPDATE_CLIENT_EVENT, mockLambdaContext);

        expect(mockSfnClient).toHaveReceivedCommandWith(StartSyncExecutionCommand, {
            input: JSON.stringify(TEST_UPDATE_SERVICE),
            stateMachineArn: TEST_STATE_MACHINE_ARN
        });

        expect(newClientResponse).toStrictEqual({
            statusCode: 400,
            body: "Function returned error: " + stateMachineError + ", cause: " + stateMachineErrorCause
        });
    });

    it("returns a 400 when the body does not exist", async () => {
        const updateClientEvent = constructTestApiGatewayEvent({
            body: "",
            pathParameters: {}
        });

        const updateClientResponse = await doUpdateServiceHandler(updateClientEvent, mockLambdaContext);

        expect(updateClientResponse).toStrictEqual({
            statusCode: 400,
            body: "Invalid Request, missing body"
        });
    });

    it("returns a 400 when a serviceId does not exist", async () => {
        const updateClientEvent = constructTestApiGatewayEvent({
            body: JSON.stringify({}),
            pathParameters: {}
        });

        const updateClientResponse = await doUpdateServiceHandler(updateClientEvent, mockLambdaContext);

        expect(updateClientResponse).toStrictEqual({
            statusCode: 400,
            body: "Invalid Request, missing service ID"
        });
    });

    it("returns the validation response when the authorisation header is not valid", async () => {
        validateAuthorisationHeaderMock.mockReturnValue({
            valid: false,
            errorResponse: {
                statusCode: 400,
                body: "Invalid access token"
            }
        });

        const updateClientEvent = constructTestApiGatewayEvent({
            body: JSON.stringify({serviceId: TEST_SERVICE_ID}),
            pathParameters: {}
        });

        const updateClientResponse = await doUpdateServiceHandler(updateClientEvent, mockLambdaContext);

        expect(updateClientResponse).toStrictEqual({
            statusCode: 400,
            body: "Invalid access token"
        });
    });

    it("returns a 403 when the service-user does not exist", async () => {
        checkServiceUserExistsSpy.mockResolvedValue(false);

        const updateClientEvent = constructTestApiGatewayEvent({
            body: JSON.stringify({serviceId: TEST_SERVICE_ID}),
            pathParameters: {}
        });

        const updateClientResponse = await doUpdateServiceHandler(updateClientEvent, mockLambdaContext);

        expect(updateClientResponse).toStrictEqual({
            statusCode: 403,
            body: "Forbidden"
        });
    });
});
