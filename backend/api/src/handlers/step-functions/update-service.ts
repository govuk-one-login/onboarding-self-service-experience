import {APIGatewayProxyEvent, APIGatewayProxyResult, Context} from "aws-lambda";
import {stepFunctionHandler} from "./step-function-handler";
import {validateAuthorisationHeader} from "../helper/validate-authorisation-header";
import DynamoDbClient from "../../dynamodb-client";

type ClientUpdates = Record<string, string | string[] | boolean>;

export type UpdateServiceBody = {
    serviceId?: string;
    selfServiceClientId: string;
    clientId: string;
    updates: ClientUpdates;
};

const client = new DynamoDbClient();

export const doUpdateServiceHandler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
    if (!event.body) {
        return {statusCode: 400, body: "Invalid Request, missing body"};
    }

    const updateServiceBody: UpdateServiceBody = JSON.parse(event.body);
    const serviceId = updateServiceBody.serviceId;

    if (!serviceId) {
        return {statusCode: 400, body: "Invalid Request, missing service ID"};
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

    return stepFunctionHandler(event, context);
};
