import {SFNClient, StartSyncExecutionCommand, SyncExecutionStatus} from "@aws-sdk/client-sfn";
import {mockClient} from "aws-sdk-client-mock";
import {constructTestApiGatewayEvent, mockLambdaContext} from "../utils";
import {doUpdateClientHandler} from "../../../src/handlers/step-functions/update-client";
import {TEST_ACCESS_TOKEN, TEST_SERVICE_ID, TEST_USER_EMAIL, TEST_USER_ID} from "../constants";
import {TEST_STATE_MACHINE_ARN} from "../../setup";
import "aws-sdk-client-mock-jest";
import DynamoDbClient from "../../../src/dynamodb-client";

const TEST_UPDATE_CLIENT_PAYLOAD = {
    serviceId: TEST_SERVICE_ID,
    updates: {
        contactEmail: TEST_USER_EMAIL
    }
};
const mockSfnClient = mockClient(SFNClient);

describe("newClientHandler tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("returns a 400 for no body", async () => {
        const serviceUserSpy = jest.spyOn(DynamoDbClient.prototype, "checkServiceUserExists");

        const newClientResponse = await doUpdateClientHandler(
            constructTestApiGatewayEvent({
                body: "",
                pathParameters: {},
                headers: {Authorization: `Bearer ${TEST_ACCESS_TOKEN}`}
            }),
            mockLambdaContext
        );

        expect(serviceUserSpy).not.toHaveBeenCalled();
        expect(mockSfnClient).not.toHaveReceivedAnyCommand();

        expect(newClientResponse).toStrictEqual({
            statusCode: 400,
            body: "Invalid Request, missing body"
        });
    });

    it("returns a 400 for no serviceId in the body", async () => {
        const serviceUserSpy = jest.spyOn(DynamoDbClient.prototype, "checkServiceUserExists");

        const newClientResponse = await doUpdateClientHandler(
            constructTestApiGatewayEvent({
                body: JSON.stringify({
                    updates: {
                        contactEmail: TEST_USER_EMAIL
                    }
                }),
                pathParameters: {},
                headers: {Authorization: `Bearer ${TEST_ACCESS_TOKEN}`}
            }),
            mockLambdaContext
        );

        expect(serviceUserSpy).not.toHaveBeenCalled();
        expect(mockSfnClient).not.toHaveReceivedAnyCommand();

        expect(newClientResponse).toStrictEqual({
            statusCode: 400,
            body: "Invalid Request, missing serviceId"
        });
    });

    it("returns a 403 if the service user relation does not exist", async () => {
        const serviceUserSpy = jest.spyOn(DynamoDbClient.prototype, "checkServiceUserExists").mockResolvedValue(false);

        const newClientResponse = await doUpdateClientHandler(
            constructTestApiGatewayEvent({
                body: JSON.stringify(TEST_UPDATE_CLIENT_PAYLOAD),
                pathParameters: {},
                headers: {Authorization: `Bearer ${TEST_ACCESS_TOKEN}`}
            }),
            mockLambdaContext
        );

        expect(serviceUserSpy).toHaveBeenCalledWith(TEST_SERVICE_ID, TEST_USER_ID);
        expect(mockSfnClient).not.toHaveReceivedAnyCommand();

        expect(newClientResponse).toStrictEqual({
            statusCode: 403,
            body: "Forbidden"
        });
    });

    it("returns a 200 for a successful state machine invoke", async () => {
        const mockSfnResponse = {
            status: SyncExecutionStatus.SUCCEEDED,
            $metadata: {httpStatusCode: 200},
            executionArn: TEST_STATE_MACHINE_ARN
        };
        mockSfnClient.on(StartSyncExecutionCommand).resolves(mockSfnResponse);
        const serviceUserSpy = jest.spyOn(DynamoDbClient.prototype, "checkServiceUserExists").mockResolvedValue(true);

        const newClientResponse = await doUpdateClientHandler(
            constructTestApiGatewayEvent({
                body: JSON.stringify(TEST_UPDATE_CLIENT_PAYLOAD),
                pathParameters: {},
                headers: {Authorization: `Bearer ${TEST_ACCESS_TOKEN}`}
            }),
            mockLambdaContext
        );

        expect(serviceUserSpy).toHaveBeenCalledWith(TEST_SERVICE_ID, TEST_USER_ID);
        expect(mockSfnClient).toHaveReceivedCommandWith(StartSyncExecutionCommand, {
            input: JSON.stringify(TEST_UPDATE_CLIENT_PAYLOAD),
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

        const newClientResponse = await doUpdateClientHandler(
            constructTestApiGatewayEvent({
                body: JSON.stringify(TEST_UPDATE_CLIENT_PAYLOAD),
                pathParameters: {},
                headers: {Authorization: `Bearer ${TEST_ACCESS_TOKEN}`}
            }),
            mockLambdaContext
        );

        expect(mockSfnClient).toHaveReceivedCommandWith(StartSyncExecutionCommand, {
            input: JSON.stringify(TEST_UPDATE_CLIENT_PAYLOAD),
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

        const newClientResponse = await doUpdateClientHandler(
            constructTestApiGatewayEvent({
                body: JSON.stringify(TEST_UPDATE_CLIENT_PAYLOAD),
                pathParameters: {},
                headers: {Authorization: `Bearer ${TEST_ACCESS_TOKEN}`}
            }),
            mockLambdaContext
        );

        expect(mockSfnClient).toHaveReceivedCommandWith(StartSyncExecutionCommand, {
            input: JSON.stringify(TEST_UPDATE_CLIENT_PAYLOAD),
            stateMachineArn: TEST_STATE_MACHINE_ARN
        });

        expect(newClientResponse).toStrictEqual({
            statusCode: 400,
            body: "Function returned error: " + stateMachineError + ", cause: " + stateMachineErrorCause
        });
    });
});
