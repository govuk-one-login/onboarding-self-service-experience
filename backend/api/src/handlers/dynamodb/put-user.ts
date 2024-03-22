import {APIGatewayProxyResult} from "aws-lambda";
import DynamoDbClient from "../../dynamodb-client";
import {handlerInvokeEvent} from "../handler-utils";

const client = new DynamoDbClient();

export const putUserHandler = async (event: handlerInvokeEvent): Promise<APIGatewayProxyResult> => {
    const user = JSON.parse(event.body as string);

    // Do whatever validation we want to do on the user

    const response = {statusCode: 200, body: JSON.stringify("OK")};
    await client
        .put(user)
        .then(putItemOutput => {
            response.statusCode = 200;
            response.body = JSON.stringify(putItemOutput);
        })
        .catch(putItemOutput => {
            response.statusCode = 500;
            response.body = JSON.stringify(putItemOutput);
        });

    return response;
};
