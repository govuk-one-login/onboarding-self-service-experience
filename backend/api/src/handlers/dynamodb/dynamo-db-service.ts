import DynamoDbClient from "../../dynamodb-client";
import console from "console";
import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import {validateAuthorisationHeader} from "../helper/validate-authorisation-header";

const dynamoDBClient = new DynamoDbClient();

export const getDynamoDBEntriesHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    //This endpoint is unauthorised because it is called in controllers
    //where the user may not have an access token present in their session
    //such as in the forgot password flow before login
    console.log("dynamo-db-inspector - In getDynamoDBEntriesHandler");

    const response = {statusCode: 404, body: JSON.stringify("")};
    const userEmail = event.pathParameters?.userEmail;

    if (!userEmail) {
        return {
            statusCode: 400,
            body: "Missing userEmail parameter in request"
        };
    }

    const result = await dynamoDBClient.getListOfClients();

    if (result == null || result.Items == null) {
        throw new Error("Unable to check DynamoDB for Items of User Email");
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
    const authHeader = event.headers.Authorization;

    const authorisationHeaderValidation = validateAuthorisationHeader(authHeader);

    if (!authorisationHeaderValidation.valid) {
        return authorisationHeaderValidation.errorResponse;
    }

    const response = {statusCode: 500, body: JSON.stringify("")};
    const payload = event?.body ? JSON.parse(event.body as string) : event;
    const userId = payload.userId;
    const serviceID = payload.serviceId;

    if (userId == null || serviceID == null) {
        throw new Error("No details provided for DeleteDynamoDBClientEntries");
    }

    const isUserAuthorised = await dynamoDBClient.checkServiceUserExists(serviceID, authorisationHeaderValidation.userId);

    const userIdWithoutPrefix = userId.includes("user#") ? userId.substring("user#".length) : userId;

    if (!isUserAuthorised || userIdWithoutPrefix !== authorisationHeaderValidation.userId) {
        return {
            statusCode: 403,
            body: "Forbidden"
        };
    }

    await dynamoDBClient.deleteDynamoDBClientEntries(userId, serviceID);
    response.statusCode = 200;

    return response;
};

export const deleteDynamoDBServiceEntriesHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log("dynamo-db-inspector - In deleteDynamoDBServiceEntriesHandler");
    const authHeader = event.headers.Authorization;

    const authorisationHeaderValidation = validateAuthorisationHeader(authHeader);

    if (!authorisationHeaderValidation.valid) {
        return authorisationHeaderValidation.errorResponse;
    }

    const response = {statusCode: 500, body: JSON.stringify("")};
    const payload = event?.body ? JSON.parse(event.body as string) : event;
    const serviceID = payload.serviceId;

    if (serviceID == null) {
        throw new Error("No Service ID provided for DeleteDynamoDBServiceEntries");
    }
    const isUserAuthorised = await dynamoDBClient.checkServiceUserExists(serviceID, authorisationHeaderValidation.userId);

    if (!isUserAuthorised) {
        return {
            statusCode: 403,
            body: "Forbidden"
        };
    }
    await dynamoDBClient.deleteDynamoDBServiceEntries(serviceID);
    response.statusCode = 200;

    return response;
};
