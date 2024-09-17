import {APIGatewayProxyEvent, APIGatewayProxyResult, Context} from "aws-lambda";
import {stepFunctionHandler} from "./step-function-handler";
import {validateAuthorisationHeader} from "../helper/validate-authorisation-header";
import DynamoDbClient from "../../dynamodb-client";

const client = new DynamoDbClient();

export const doUpdateClientHandler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
    if (!event.body) {
        return {statusCode: 400, body: "Invalid Request, missing body"};
    }

    const updateClientBody: {
        serviceId: string;
        updates: Record<string, string>;
    } = JSON.parse(event.body);

    const serviceId = updateClientBody.serviceId;

    if (!serviceId) {
        return {statusCode: 400, body: "Invalid Request, missing serviceId"};
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
