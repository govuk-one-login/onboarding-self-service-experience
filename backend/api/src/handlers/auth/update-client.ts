import {Context, APIGatewayProxyResult} from "aws-lambda";
import axios, {AxiosResponse} from "axios";
import {Logger} from "@aws-lambda-powertools/logger";

export const logger = new Logger({
    serviceName: "self-service-experience"
});

export type UpdateClientPayload = {
    clientId: string;
    serviceId: string;
    selfServiceClientId: string;
    updates: Record<string, unknown>;
};

// Handler is invoked by step function not API Gateway
//The event type is not APIGatewayProxyEvent but the custom JSON payload from the step function invokes
export const updateClientInRegistryHandler = async (event: UpdateClientPayload, context: Context): Promise<APIGatewayProxyResult> => {
    logger.addContext(context);

    const url = process.env.AUTH_REGISTRATION_BASE_URL + "/connect/register/" + event.clientId;

    if (event.updates.hasOwnProperty("service_name")) {
        // Service Name in SSE maps to Client Name in Registry
        event.updates.client_name = event.updates.service_name;
    }

    const response = await axios
        .put(url, event.updates, {
            headers: {
                "Content-Type": "application/json",
                "X-API-Key": process.env.AUTH_API_KEY as string
            }
        })
        .then(handleResponse(event))
        .catch(error => {
            logger.error("Client registry request failed with response.", error as Error);
            throw error;
        });

    return {
        statusCode: response.status,
        body: JSON.stringify({
            ...response.data,
            updates: response.event.updates,
            serviceId: response.event.serviceId,
            selfServiceClientId: response.event.selfServiceClientId
        })
    };
};

const handleResponse = (event: UpdateClientPayload) => {
    return (result: AxiosResponse) => {
        if (event.updates.hasOwnProperty("client_name")) {
            // Must remove this if we added it otherwise later functions will break
            delete event.updates["client_name"];
        }

        return {data: result.data, status: result.status, event};
    };
};
