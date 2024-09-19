import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import DynamoDbClient from "../../dynamodb-client";
import {validateAuthorisationHeader} from "../helper/validate-authorisation-header";

const client = new DynamoDbClient();

export const getUserHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const cognitoId = JSON.parse(event.body as string);
    const authHeader = event.headers.Authorization;

    const authorisationHeaderValidation = validateAuthorisationHeader(authHeader);

    if (!authorisationHeaderValidation.valid) {
        return authorisationHeaderValidation.errorResponse;
    }
    const userIdWithoutPrefix = cognitoId.includes("user#") ? cognitoId.substring("user#".length) : cognitoId;

    if (authorisationHeaderValidation.userId !== userIdWithoutPrefix) {
        return {
            statusCode: 403,
            body: "Forbidden"
        };
    }

    const response = {statusCode: 200, body: JSON.stringify("OK")};

    await client
        .getUser(cognitoId)
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
