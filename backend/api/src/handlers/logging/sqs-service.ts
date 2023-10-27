import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import {SendMessageCommand, SQSClient} from "@aws-sdk/client-sqs";
import * as process from "process";
import {TxMAEvent} from "./txma-event";

const client = new SQSClient({region: "eu-west-2"});

export const sendSQSMessageToTxMAHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let payload: TxMAEvent;
    let response = {
        statusCode: 200,
        body: JSON.stringify("Error")
    };

    if (event.body != null) {
        payload = JSON.parse(event.body);
        const queueUrl = process.env.QUEUEURL;
        console.log(queueUrl);
        const messageParams = {
            MessageBody: JSON.stringify(payload),
            QueueUrl: queueUrl
        };

        try {
            const data = await client.send(new SendMessageCommand(messageParams));
            if (data) {
                console.log(JSON.stringify(payload));
                const bodyMessage = "Message Send to SQS - Here is MessageId: " + data.MessageId;
                response = {
                    statusCode: 200,
                    body: JSON.stringify(bodyMessage)
                };
            } else {
                response = {
                    statusCode: 200,
                    body: JSON.stringify("Error")
                };
            }
            return response;
        } catch (error) {
            console.log("Error", error);
        }
    }

    return response;
};
