import {SQSClient, SendMessageCommand} from "@aws-sdk/client-sqs";
import {TEST_MESSAGE_ID} from "../constants";
import {constructTestApiGatewayEvent} from "../utils";
import {sendSQSMessageToTxMAHandler} from "./../../../src/handlers/logging/sqs-service";
import {TEST_SQS_QUEUE_URL} from "../../setup";
import {mockClient} from "aws-sdk-client-mock";
import "aws-sdk-client-mock-jest";

const mockSqsClient = mockClient(SQSClient);

const TEST_EVENT = {
    event_name: "Hi there"
};

const TEST_HANDLER_EVENT = constructTestApiGatewayEvent({
    body: JSON.stringify(TEST_EVENT),
    pathParameters: {}
});

describe("sendSQSMessageToTxMAHandler tests", () => {
    beforeEach(() => {
        jest.spyOn(console, "log");
        jest.clearAllMocks();
        mockSqsClient.reset();
    });

    it("returns a 200 and the stringified success message when the sqs message sends successfully", async () => {
        mockSqsClient.on(SendMessageCommand).resolves({MessageId: TEST_MESSAGE_ID});

        const response = await sendSQSMessageToTxMAHandler(TEST_HANDLER_EVENT);

        expect(mockSqsClient).toHaveReceivedCommandWith(SendMessageCommand, {
            QueueUrl: TEST_SQS_QUEUE_URL,
            MessageBody: JSON.stringify(TEST_EVENT)
        });
        expect(response).toStrictEqual({
            statusCode: 200,
            body: JSON.stringify("Message Send to SQS - Here is MessageId: " + TEST_MESSAGE_ID)
        });
    });

    it("returns a 200 and the phrase error stringified when there is no event body", async () => {
        const event = constructTestApiGatewayEvent();
        event.body = null;

        const response = await sendSQSMessageToTxMAHandler(event);

        expect(mockSqsClient).not.toReceiveAnyCommand();
        expect(response).toStrictEqual({
            statusCode: 200,
            body: JSON.stringify("Error")
        });
    });

    it("returns a 200 and the phrase error stringified and logs the error when the sqs client throws an error", async () => {
        const sqsErr = "sqsErr";
        mockSqsClient.on(SendMessageCommand).rejects(sqsErr);

        const response = await sendSQSMessageToTxMAHandler(TEST_HANDLER_EVENT);

        expect(mockSqsClient).toHaveReceivedCommandWith(SendMessageCommand, {
            QueueUrl: TEST_SQS_QUEUE_URL,
            MessageBody: JSON.stringify(TEST_EVENT)
        });
        expect(console.log).toHaveBeenCalledWith("Error", Error(sqsErr));
        expect(response).toStrictEqual({
            statusCode: 200,
            body: JSON.stringify("Error")
        });
    });
});
