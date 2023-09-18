import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import DynamoDbClient from "../../dynamodb-client";

const client = new DynamoDbClient();

export const globalSignOutHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userEmail = event.pathParameters?.userEmail;
    if (userEmail === undefined) {
        return noUserEmailResponse;
    }

    const response = {statusCode: 200, body: JSON.stringify({email: userEmail, deletedItemCount: 0})};

    await client
        .deleteSessions(userEmail)
        .then(commandOutput => {
            response.statusCode = 200;
            response.body = JSON.stringify({email: userEmail, deletedItemCount: commandOutput.deletedItemCount});
        })
        .catch(queryCommandOutputError => {
            console.error(queryCommandOutputError);
            response.statusCode = 500;
            response.body = JSON.stringify({errorMessage: queryCommandOutputError});
        });
    return response;
};

const noUserEmailResponse = {
    statusCode: 400,
    body: JSON.stringify("No userEmail request parameter supplied")
};
