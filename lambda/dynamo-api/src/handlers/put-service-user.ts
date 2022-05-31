import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
// Create clients and set shared const values outside of the handler.

import DynamoClient from "../client/DynamoClient";
import {PutItemCommandOutput} from "@aws-sdk/client-dynamodb";

// Get the DynamoDB table name from environment variables

const tableName = process.env.SAMPLE_TABLE;
const client = new DynamoClient(tableName as string);

export const putServiceUserHandler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
    console.log("Received event:")
    console.log(event);
    console.log(context);
    const payload = event?.body ? JSON.parse(event.body as string) : event;
    const record = {
        pk: payload.service.pk,
        sk: payload.user.pk,
        data: payload.user.email,
        service_name: payload.service.service_name
    }
    let response = {statusCode: 200, body: JSON.stringify("OK")};
    await client
        .put(record)
        .then((putItemOutput) => {
            response.statusCode = 200;
            response.body = JSON.stringify(putItemOutput)
        })
        .catch((putItemOutput) => { response.statusCode = 500; response.body = JSON.stringify(putItemOutput)});

    return response;
};