import {APIGatewayProxyEvent} from "aws-lambda";
import DynamoClient from "../client/DynamoClient";

const client = new DynamoClient();

// TODO remove explicit any
export const updateUserHandler = async (event: APIGatewayProxyEvent): Promise<any> => {
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
