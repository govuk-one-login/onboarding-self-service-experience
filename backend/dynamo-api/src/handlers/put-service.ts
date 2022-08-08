import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import DynamoClient from "../client/DynamoClient";

const client = new DynamoClient();

export const putServiceHandler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
    const payload = event?.body ? JSON.parse(event.body as string) : event;

    let response = {statusCode: 200, body: JSON.stringify("OK")};
    await client
        .put(payload.service)
        .then((putItemOutput) => {
            response.statusCode = 200;
            response.body = JSON.stringify(putItemOutput)
        })
        .catch((putItemOutput) => {
            console.error(putItemOutput), response.statusCode = 500;
            response.body = JSON.stringify(putItemOutput)
        });

    return response;
};
