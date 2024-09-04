import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import DynamoDbClient from "../../dynamodb-client";

const client = new DynamoDbClient();

export const getServiceClientsHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const serviceId = event.pathParameters?.serviceId;
    if (serviceId === undefined) {
        return {
            statusCode: 400,
            body: "No serviceId request parameter supplied"
        };
    }

    const authHeaderValidationResult = validateAuthorizationHeader(event.headers.Authorization);

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

const validateAuthorizationHeader = (
    authHeader: string | undefined
):
    | {
          valid: true;
          userId: string;
      }
    | {
          valid: false;
          errorResponse: {
              statusCode: number;
              body: string;
          };
      } => {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return {
            valid: false,
            errorResponse: {
                statusCode: 401,
                body: "Missing access token"
            }
        };
    }

    const authToken = authHeader.substring(7);
    //We trust the signature as this token is attached from
    //the frontend which does the validation
    const tokenParts = authToken.split(".");

    if (tokenParts.length !== 3) {
        return {
            valid: false,
            errorResponse: {
                statusCode: 400,
                body: "Invalid access token"
            }
        };
    }

    const encodedPayload = tokenParts[1];
    const decodedPayload = Buffer.from(encodedPayload, "base64url").toString("utf-8");
    const parsedPayload = JSON.parse(decodedPayload);

    const subjectClaim = parsedPayload.sub;

    if (typeof subjectClaim !== "string") {
        return {
            valid: false,
            errorResponse: {
                statusCode: 400,
                body: "Invalid access token"
            }
        };
    }

    return {
        valid: true,
        userId: subjectClaim
    };
};
