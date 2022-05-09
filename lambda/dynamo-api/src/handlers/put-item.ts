import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
// Create clients and set shared const values outside of the handler.
import {DynamoDBClient, PutItemCommand} from "@aws-sdk/client-dynamodb";

// Create a DocumentClient that represents the query to add an item
const dynamodb = new DynamoDBClient({ region: "eu-west-2" });

// Get the DynamoDB table name from environment variables
const tableName = process.env.SAMPLE_TABLE;

/**
 * A simple example includes a HTTP post method to add one item to a DynamoDB table.
 */
export const putItemHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    if (event.httpMethod !== 'POST') {
        throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
    }
    // All log statements are written to CloudWatch
    console.info('received:', event);

    // Get id and name from the body of the request
    const body = JSON.parse(event.body || "{}");
    console.log("BODY:" + JSON.stringify(body));
    const id = body.id;
    const name = body.name;

    // Creates a new item, or replaces an old item with a new item
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#put-property
    var params = {
        TableName : tableName,
        Item: { id: {S: id}, name: {S: name} }
    };
    const command = new PutItemCommand(params);
    const result = await dynamodb.send(command);

    const response = {
        statusCode: 200,
        body: JSON.stringify(body)
    };

    // All log statements are written to CloudWatch
    console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
    return response;
};
