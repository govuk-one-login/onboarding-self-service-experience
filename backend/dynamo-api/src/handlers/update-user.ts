import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import DynamoClient from "../client/DynamoClient";

const tableName = process.env.TABLE;
const client = new DynamoClient(tableName as string);

export const updateUserHandler = async (event: APIGatewayProxyEvent): Promise<any> => {
    const body = JSON.parse(event.body as string);
    let response = {statusCode: 200, body: JSON.stringify("OK")};
    await client
        .updateClient(body.userId, body.cognitoUserId, body.updates)
        .then((updateItemCommandOutput) => {
            response.statusCode = 200;
            response.body = JSON.stringify(updateItemCommandOutput)
        })
        .catch((putItemOutput) => {
            console.log(putItemOutput)
            response.statusCode = 500;
            response.body = JSON.stringify(putItemOutput)
        });

    return response;
};
