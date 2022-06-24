import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import {LambdaClient, LambdaClientConfig, InvokeCommand, InvokeCommandInput} from "@aws-sdk/client-lambda";

import axios, {Axios, AxiosResponse} from "axios"; // until Onboarding takes over client registry / just for now

let instance: Axios;

instance = axios.create({
        baseURL: process.env.AUTH_REGISTRATION_BASE_URL,
        headers: {
            "Content-Type": "application/json"
        }
    });


export const registerClientHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log(process.env.AUTH_REGISTRATION_BASE_URL)

    let payload: any = event;
    console.log("Payload")
    console.log(payload)

    let clientConfig = {
        client_name: payload.service.service_name,
        public_key: 'MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEAp2mLkQGo24Kz1rut0oZlviMkGomlQCH+iT1pFvegZFXq39NPjRWyatmXp/XIUPqCq9Kk8/+tq4Sgjw+EM5tATJ06j5r+35of58ATGVPniW//IhGizrv6/ebGcGEUJ0Y/ZmlCHYPV+lbewpttQ/IYKM1nr3k/Rl6qepbVYe+MpGubluQvdhgUYel9OzxiOvUk7XI0axPquiXzoEgmNNOai8+WhYTkBqE3/OucAv+XwXdnx4XHmKzMwTv93dYMpUmvTxWcSeEJ/4/SrbiK4PyHWVKU2BozfSUejVNhahAzZeyyDwhYJmhBaZi/3eOOlqGXj9UdkOXbl3vcwBH8wD30O9/4F5ERLKxzOaMnKZ+RpnygWF0qFhf+UeFMy+O06sdgiaFnXaSCsIy/SohspkKiLjNnhvrDNmPLMQbQKQlJdcp6zUzI7Gzys7luEmOxyMpA32lDBQcjL7KNwM15s4ytfrJ46XEPZUXESce2gj6NazcPPsrTa/Q2+oLS9GWupGh7AgMBAAE=',
        redirect_uris: ['http://localhost/'],
        contacts: [payload.contactEmail],
        scopes: ['openid', 'email', 'phone'],
        post_logout_redirect_uris: ['http://localhost/'],
        subject_type: 'pairwise',
        service_type: 'MANDATORY',
        sector_identifier_uri: 'http://localhost/'
    }
    console.log("About to use Axios with payload of");
    console.log(clientConfig);
    const result = await (await instance).post("/connect/register", JSON.stringify(clientConfig));

    console.log("The result was: " + JSON.stringify(result.data));

    const response: APIGatewayProxyResult = {
        statusCode: 200,
        body: JSON.stringify(result.data)
    }
    return response;
}