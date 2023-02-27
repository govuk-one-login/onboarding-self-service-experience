import {PublishCommand, SNSClient} from "@aws-sdk/client-sns";
import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";

const snsClient = new SNSClient({region: "eu-west-2"});

export const privateBetaRequestHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const payload = event?.body ? JSON.parse(event.body as string) : event;

    const emailContent =
        "Request to join GOV.UK One Login private beta form submitted\n\n" +
        `Name: ${payload.name}\n` +
        `Email address: ${payload.emailAddress} \n` +
        `Service name: ${payload.serviceName} \n` +
        `Department: ${payload.department}  \n`;

    const params = {
        Subject: "GOV.UK One Login private beta request form submitted",
        Message: emailContent,
        TopicArn: process.env.SNS_TOPIC_ARN
    };

    const response = {statusCode: 200, body: JSON.stringify("OK")};

    await snsClient
        .send(new PublishCommand(params))
        .then(sendOutput => {
            response.statusCode = 200;
            response.body = JSON.stringify(sendOutput);
        })
        .catch(sendOutput => {
            response.statusCode = 500;
            response.body = JSON.stringify(sendOutput);
            console.error("Error occurred in sending message to request to join private beta topic: " + response);
        });

    return response;
};
