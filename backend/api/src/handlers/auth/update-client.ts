import {APIGatewayProxyResult} from "aws-lambda";
import axios from "axios";

export type UpdateClientPayload = {
    clientId: string;
    serviceId: string;
    selfServiceClientId: string;
    updates: Record<string, unknown>;
};

// Handler is invoked by step function not API Gateway
//The event type is not APIGatewayProxyEvent but the custom JSON payload from the step function invokes
export const updateClientInRegistryHandler = async (event: UpdateClientPayload): Promise<APIGatewayProxyResult> => {
    const url = process.env.AUTH_REGISTRATION_BASE_URL + "/connect/register/" + event.clientId;
    let response: never[] = [];
    let statusCode = 200;

    if (event.updates.hasOwnProperty("service_name")) {
        // Service Name in SSE maps to Client Name in Registry
        event.updates.client_name = event.updates.service_name;
    }

    await axios
        .put(url, event.updates, {
            headers: {
                "Content-Type": "application/json",
                "X-API-Key": process.env.AUTH_API_KEY as string
            }
        })
        .then(result => {
            response = result.data;
            if (event.updates.hasOwnProperty("client_name")) {
                // Must remove this if we added it otherwise later functions will break
                delete event.updates["client_name"];
            }
        })
        .catch(error => {
            statusCode = error.response.statusCode;
            response = error.response.data.error;
        });

    return {
        statusCode: statusCode,
        body: JSON.stringify({
            ...response,
            updates: event.updates,
            serviceId: event.serviceId,
            selfServiceClientId: event.selfServiceClientId
        })
    };
};
