import {APIGatewayEvent} from "aws-lambda";
import DynamoDbClient from "../../dynamodb-client";
import {validateAuthorisationHeader} from "../helper/validate-authorisation-header";

const client = new DynamoDbClient();

export const updateUserHandler = async (event: APIGatewayEvent): Promise<{statusCode: number; body: string}> => {
    const body = JSON.parse(event.body as string);
    const response = {statusCode: 200, body: JSON.stringify("OK")};
    const userId = body.userId;

    if (!userId) {
        return {
            statusCode: 400,
            body: "No userId provided in request body"
        };
    }

    const authHeader = event.headers.Authorization;
    const authorisationHeaderValidation = validateAuthorisationHeader(authHeader);

    if (!authorisationHeaderValidation.valid) {
        return authorisationHeaderValidation.errorResponse;
    }

    const userIdWithoutPrefix = userId.includes("user#") ? userId.substring("user#".length) : userId;

    if (userIdWithoutPrefix !== authorisationHeaderValidation.userId) {
        return {
            statusCode: 403,
            body: "Forbidden"
        };
    }

    await client
        .updateUser(body.userId, body.updates)
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
