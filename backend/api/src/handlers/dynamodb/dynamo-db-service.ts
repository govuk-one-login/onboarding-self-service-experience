import DynamoDbClient from "../../dynamodb-client";
import console from "console";
import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";

const dynamoDBClient = new DynamoDbClient();

export const getDynamoDBEntriesHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log("dynamo-db-inspector - In getDynamoDBEntriesHandler");

    const response = {statusCode: 404, body: JSON.stringify("")};
    const userEmail = event.pathParameters?.userEmail;

    const result = await dynamoDBClient.getListOfClients();

    if (userEmail == null || result == null || result.Items == null) {
        throw new Error("Unable to check DynamoDB for Items of User Email =>" + userEmail);
    } else {
        response.statusCode = 200; // Need to set Response here because List might be empty (i.e. non-existent account).

        result.Items.forEach(function (row) {
            const clientDetails = JSON.stringify(row);

            if (clientDetails.includes(userEmail)) {
                response.body = clientDetails;
            }
        });
    }

    return response;
};

export const deleteDynamoDBClientEntriesHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log("dynamo-db-inspector - In deleteDynamoDBClientEntriesHandler");

    const response = {statusCode: 500, body: JSON.stringify("")};
    const payload = event?.body ? JSON.parse(event.body as string) : event;
    const userID = payload.userId;
    const serviceID = payload.serviceId;

    if (userID == null || serviceID == null) {
        throw new Error("No details provided for DeleteDynamoDBClientEntries");
    } else {
        await dynamoDBClient.deleteDynamoDBClientEntries(userID, serviceID);
        response.statusCode = 200;
    }

    return response;
};

export const deleteDynamoDBServiceEntriesHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log("dynamo-db-inspector - In deleteDynamoDBServiceEntriesHandler");

    const response = {statusCode: 500, body: JSON.stringify("")};
    const payload = event?.body ? JSON.parse(event.body as string) : event;
    const serviceID = payload.serviceId;

    if (serviceID == null) {
        throw new Error("No Service ID provided for DeleteDynamoDBServiceEntries");
    } else {
        await dynamoDBClient.deleteDynamoDBServiceEntries(serviceID);
        response.statusCode = 200;
    }

    return response;
};
