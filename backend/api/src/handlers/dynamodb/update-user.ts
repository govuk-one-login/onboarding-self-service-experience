import {APIGatewayProxyEvent} from "aws-lambda";
import DynamoDbClient from "../../dynamodb-client";

const client = new DynamoDbClient();

export const updateUserHandler = async (event: APIGatewayProxyEvent): Promise<{statusCode: number; body: string}> => {
    const body = JSON.parse(event.body as string);
    const response = {statusCode: 200, body: JSON.stringify("OK")};

    await client
        .updateUser(body.userId, body.cognitoUserId, body.updates)
        .then(updateItemCommandOutput => {
            response.statusCode = 200;
            response.body = JSON.stringify(updateItemCommandOutput);
        })
        .catch(putItemOutput => {
            response.statusCode = 500;
            response.body = JSON.stringify(putItemOutput);
        });

    return response;
};
