import {SFNClient, StartSyncExecutionCommand, SyncExecutionStatus} from "@aws-sdk/client-sfn";
import {mockClient} from "aws-sdk-client-mock";
import {constructTestApiGatewayEvent, mockLambdaContext} from "../utils";
import {doUpdateClientHandler} from "../../../src/handlers/step-functions/update-client";
import {TEST_SERVICE_ID, TEST_SERVICE_NAME, TEST_USER_EMAIL} from "../constants";
import {TEST_STATE_MACHINE_ARN} from "../../setup";
import "aws-sdk-client-mock-jest";

const TEST_UPDATE_CLIENT = {
    service: {
        serviceName: TEST_SERVICE_NAME,
        id: TEST_SERVICE_ID
    },
    updates: {
        contactEmail: TEST_USER_EMAIL
    }
};
const TEST_NEW_CLIENT_EVENT = constructTestApiGatewayEvent({
    body: JSON.stringify(TEST_UPDATE_CLIENT),
    pathParameters: {}
});
const mockSfnClient = mockClient(SFNClient);

describe("newClientHandler tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("returns a 200 for a successful state machine invoke", async () => {
        const mockSfnResponse = {
            status: SyncExecutionStatus.SUCCEEDED,
            $metadata: {httpStatusCode: 200},
            executionArn: TEST_STATE_MACHINE_ARN
        };
        mockSfnClient.on(StartSyncExecutionCommand).resolves(mockSfnResponse);

        const newClientResponse = await doUpdateClientHandler(TEST_NEW_CLIENT_EVENT, mockLambdaContext);

        expect(mockSfnClient).toHaveReceivedCommandWith(StartSyncExecutionCommand, {
            input: JSON.stringify(TEST_UPDATE_CLIENT),
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

        const newClientResponse = await doUpdateClientHandler(TEST_NEW_CLIENT_EVENT, mockLambdaContext);

        expect(mockSfnClient).toHaveReceivedCommandWith(StartSyncExecutionCommand, {
            input: JSON.stringify(TEST_UPDATE_CLIENT),
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

        const newClientResponse = await doUpdateClientHandler(TEST_NEW_CLIENT_EVENT, mockLambdaContext);

        expect(mockSfnClient).toHaveReceivedCommandWith(StartSyncExecutionCommand, {
            input: JSON.stringify(TEST_UPDATE_CLIENT),
            stateMachineArn: TEST_STATE_MACHINE_ARN
        });

        expect(newClientResponse).toStrictEqual({
            statusCode: 400,
            body: "Function returned error: " + stateMachineError + ", cause: " + stateMachineErrorCause
        });
    });
});
