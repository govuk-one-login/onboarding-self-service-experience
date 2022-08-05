import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import axios, { Axios } from "axios"; // TODO: Until Onboarding takes over client registry / just for now

let instance: Axios;

instance = axios.create({
    baseURL: process.env.AUTH_REGISTRATION_BASE_URL,
    headers: {
        "Content-Type": "application/json"
    }
});

export const updateClientInRegistryHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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
}
