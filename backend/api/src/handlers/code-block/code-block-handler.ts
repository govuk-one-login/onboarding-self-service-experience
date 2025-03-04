import {APIGatewayEvent, APIGatewayProxyResult, Context} from "aws-lambda";
import {Logger} from "@aws-lambda-powertools/logger";
import {deleteCodeBlock, getCodeBlock, putCodeBlock} from "../dynamodb/code-block-service";

export const logger = new Logger({
    serviceName: "self-service-experience"
});

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
    logger.addContext(context);

    logger.info("Code block request received");

    if (event.httpMethod !== "POST") {
        logger.warn(`Invalid HTTP method: ${event.httpMethod}`);
        return {
            statusCode: 405,
            body: `${event.httpMethod} not allowed`
        };
    }

    if (!event.body) {
        logger.warn("No request body in request");
        return {
            statusCode: 400,
            body: "Invalid request"
        };
    }

    let parsedBody;

    try {
        parsedBody = JSON.parse(event.body);
    } catch (error) {
        logger.warn("Invalid JSON in request body: " + (error as Error).message);
        return {
            statusCode: 400,
            body: "Invalid request"
        };
    }

    if (!isCodeBlockRequest(parsedBody)) {
        logger.warn("Invalid Code block request");
        return {
            statusCode: 400,
            body: "Invalid request"
        };
    }

    switch (event.path) {
        case "/code-block/get":
            logger.info("Getting code block for identifier");
            const isCodeBlockPresent = await getCodeBlock(parsedBody.id);
            return {
                statusCode: 200,
                body: JSON.stringify({
                    blocked: isCodeBlockPresent
                })
            };
        case "/code-block/put":
            logger.info("Putting code block for identifier");
            await putCodeBlock(parsedBody.id);
            return {
                statusCode: 204,
                body: ""
            };

        case "/code-block/delete":
            logger.info("Removing code block for identifier");
            await deleteCodeBlock(parsedBody.id);
            return {
                statusCode: 204,
                body: ""
            };
        default:
            logger.warn(`Invalid path; ${event.path}`);
            return {
                statusCode: 404,
                body: "Not Found"
            };
    }
};

type CodeBlockRequest = {
    id: string;
};

const isCodeBlockRequest = (arg: unknown): arg is CodeBlockRequest => {
    const requestBody = arg as CodeBlockRequest;
    return typeof requestBody === "object" && !Array.isArray(requestBody) && typeof requestBody.id === "string";
};
