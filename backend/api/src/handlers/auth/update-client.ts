import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import axios from "axios";

export const updateClientInRegistryHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // TODO remove explicit any
    // eslint-disable-next-line
    const payload: any = event;
    const url = process.env.AUTH_REGISTRATION_BASE_URL + "/connect/register/" + payload.clientId;
    const result = await axios.put(url, payload.updates, {
        headers: {
            "Content-Type": "application/json",
            "X-API-Key": process.env.AUTH_API_KEY as string
        }
    });

    return {
        statusCode: 200,
        body: JSON.stringify({
            ...result.data,
            updates: payload.updates,
            serviceId: payload.serviceId,
            selfServiceClientId: payload.selfServiceClientId
        })
    };
};
