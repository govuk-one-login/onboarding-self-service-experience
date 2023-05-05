import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import axios, {Axios} from "axios";

// TODO: Until Onboarding takes over client registry / just for now
const instance: Axios = axios.create({
    baseURL: process.env.AUTH_REGISTRATION_BASE_URL,
    headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.AUTH_API_KEY as string
    }
});

export const updateClientInRegistryHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // TODO remove explicit any
    // eslint-disable-next-line
    const payload: any = event;
    const result = await (await instance).put(`/connect/register/${payload.clientId}`, payload.updates);

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
