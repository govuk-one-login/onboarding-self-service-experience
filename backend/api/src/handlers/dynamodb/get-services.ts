import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import DynamoDbClient from "../../dynamodb-client";

const client = new DynamoDbClient();

export const getServicesHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId = event.pathParameters?.userId;
    if (userId === undefined) {
        return noUserIdResponse;
    }

    const response = {statusCode: 200, body: JSON.stringify(userId)};
    await client
        .getServices(userId)
        .then(queryCommandOutput => {
            response.statusCode = 200;
            response.body = JSON.stringify(queryCommandOutput);
        })
        .catch(queryCommandOutput => {
            console.error(queryCommandOutput);
            response.statusCode = 500;
            response.body = JSON.stringify(queryCommandOutput);
        });

    return response;
};

const noUserIdResponse = {
    statusCode: 400,
    body: JSON.stringify("No userId request parameter supplied")
};
