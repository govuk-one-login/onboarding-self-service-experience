import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import DynamoClient from "../client/DynamoClient";

const client = new DynamoClient();

export const putUserHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const user = JSON.parse(event.body as string);

    // Do whatever validation we want to do on the user

    let response = {statusCode: 200, body: JSON.stringify("OK")};
    await client
        .put(user)
        .then((putItemOutput) => {
            response.statusCode = 200;
            response.body = JSON.stringify(putItemOutput)
        })
        .catch((putItemOutput) => {
            response.statusCode = 500;
            response.body = JSON.stringify(putItemOutput)
        });

    return response;
};
