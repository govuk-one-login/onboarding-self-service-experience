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
    const result = await axios.put(url, event.updates, {
        headers: {
            "Content-Type": "application/json",
            "X-API-Key": process.env.AUTH_API_KEY as string
        }
    });

    return {
        statusCode: 200,
        body: JSON.stringify({
            ...result.data,
            updates: event.updates,
            serviceId: event.serviceId,
            selfServiceClientId: event.selfServiceClientId
        })
    };
};
