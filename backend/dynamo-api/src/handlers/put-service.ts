import {APIGatewayProxyEvent, APIGatewayProxyResult, Context} from 'aws-lambda';
// Create clients and set shared const values outside of the handler.

import DynamoClient from "../client/DynamoClient";
import {PutItemCommandOutput} from "@aws-sdk/client-dynamodb";

// Get the DynamoDB table name from environment variables

const tableName = process.env.TABLE;
const client = new DynamoClient(tableName as string);

export const putServiceHandler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
    console.log("Received event:")
    console.log(event);
    console.log(context);
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