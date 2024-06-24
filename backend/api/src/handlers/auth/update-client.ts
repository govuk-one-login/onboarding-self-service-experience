import {APIGatewayProxyResult} from "aws-lambda";
import axios, {AxiosResponse, isAxiosError} from "axios";

export type UpdateClientPayload = {
    clientId: string;
    serviceId: string;
    selfServiceClientId: string;
    updates: Record<string, unknown>;
};

// Handler is invoked by step function not API Gateway
//The event type is not APIGatewayProxyEvent but the custom JSON payload from the step function invokes
export const updateClientInRegistryHandler = async (event: UpdateClientPayload): Promise<APIGatewayProxyResult> => {
    console.log("Update client request received")
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
            if (isAxiosError(error)) {
                console.error(
                    `Client registry request failed with response: "${error.response?.status}" and message "${error.response?.data}"`
                );
            }
            throw error;
        });

    return {
        statusCode: response.status,
        body: JSON.stringify({
            ...response.response,
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

        return {response: result.data, status: result.status, event};
    };
};
