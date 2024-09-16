import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import DynamoDbClient from "../../dynamodb-client";
import {validateAuthorisationHeader} from "../helper/validate-authorisation-header";

const client = new DynamoDbClient();

export const getServiceClientsHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const serviceId = event.pathParameters?.serviceId;
    if (serviceId === undefined) {
        return {
            statusCode: 400,
            body: "No serviceId request parameter supplied"
        };
    }

    const authHeaderValidationResult = validateAuthorisationHeader(event.headers.Authorization);

    if (!authHeaderValidationResult.valid) {
        return authHeaderValidationResult.errorResponse;
    }

    const isUserAuthorised = await client.checkServiceUserExists(serviceId, authHeaderValidationResult.userId);

    if (!isUserAuthorised) {
        return {
            statusCode: 403,
            body: "Forbidden"
        };
    }

    const response = {statusCode: 200, body: JSON.stringify(serviceId)};
    await client
        .getClients(serviceId)
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
