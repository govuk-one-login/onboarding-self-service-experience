import {AuthenticationResultType} from "@aws-sdk/client-cognito-identity-provider";
import {QueryCommandOutput} from "@aws-sdk/client-dynamodb";
import {AxiosResponse} from "axios";
import {OnboardingTableItem} from "../../../@types/OnboardingTableItem";
import {Service} from "../../../@types/Service";
import {DynamoUser} from "../../../@types/user";
import {Updates} from "../self-service-services-service";
import LambdaFacadeInterface from "./LambdaFacadeInterface";

/* eslint-disable @typescript-eslint/no-unused-vars --
 * Ignore unused vars in stubs
 */
class StubLambdaFacade implements LambdaFacadeInterface {
    user: DynamoUser = {
        last_name: {S: "we haven't collected this last name"},
        data: {S: "we haven't collected this full name"},
        first_name: {S: "we haven't collected this first name"},
        password_last_updated: {S: "2022-08-04T13:42:00.821Z"},
        sk: {S: "user#29ad13ba-ceca-4141-95d7-e376b0ca4688"},
        email: {S: "registered@gds.gov.uk"},
        pk: {S: "user#29ad13ba-ceca-4141-95d7-e376b0ca4688"},
        phone: {S: "07700 987 654"}
    };

    private DEFAULT_PUBLIC_KEY =
        "MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEAp2mLkQGo24Kz1rut0oZlviMkGomlQCH+iT1pFvegZFXq39NPjRWyatmXp/XIUPqCq9Kk8/+tq4Sgjw+EM5tATJ06j5r+35of58ATGVPniW//IhGizrv6/ebGcGEUJ0Y/ZmlCHYPV+lbewpttQ/IYKM1nr3k/Rl6qepbVYe+MpGubluQvdhgUYel9OzxiOvUk7XI0axPquiXzoEgmNNOai8+WhYTkBqE3/OucAv+XwXdnx4XHmKzMwTv93dYMpUmvTxWcSeEJ/4/SrbiK4PyHWVKU2BozfSUejVNhahAzZeyyDwhYJmhBaZi/3eOOlqGXj9UdkOXbl3vcwBH8wD30O9/4F5ERLKxzOaMnKZ+RpnygWF0qFhf+UeFMy+O06sdgiaFnXaSCsIy/SohspkKiLjNnhvrDNmPLMQbQKQlJdcp6zUzI7Gzys7luEmOxyMpA32lDBQcjL7KNwM15s4ytfrJ46XEPZUXESce2gj6NazcPPsrTa/Q2+oLS9GWupGh7AgMBAAE=";
    publicKey = this.DEFAULT_PUBLIC_KEY;

    serviceName = "";

    constructor() {
        console.log("Creating stub lambda facade...");
    }

    getUserByCognitoId(cognitoId: string, accessToken: string): Promise<AxiosResponse> {
        return Promise.resolve({
            data: {
                Item: this.user
            }
        } as AxiosResponse);
    }

    newService(service: Service, userId: string, email: string, accessToken: string): Promise<AxiosResponse> {
        this.serviceName = service.serviceName;
        return Promise.resolve({data: {output: JSON.stringify({serviceId: "stub-service-id"})}} as AxiosResponse);
    }

    putUser(user: OnboardingTableItem, accessToken: string): Promise<AxiosResponse> {
        return Promise.resolve({} as AxiosResponse);
    }

    generateClient(service: Service, authenticationResult: AuthenticationResultType): Promise<AxiosResponse> {
        return Promise.resolve({
            data: {
                output: JSON.stringify({body: JSON.stringify({pk: "stub-service-id"})})
            }
        } as AxiosResponse);
    }

    updateClient(
        serviceId: string,
        selfServiceClientId: string,
        clientId: string,
        updates: Record<string, string>,
        accessToken: string
    ): Promise<AxiosResponse> {
        if (updates.public_key) {
            this.publicKey = updates.public_key;
        }
        if (updates.service_name) {
            this.serviceName = updates.service_name;
        }
        return Promise.resolve({} as AxiosResponse);
    }

    listServices(userId: string, accessToken: string): Promise<AxiosResponse> {
        return Promise.resolve({
            data: {
                Items: [
                    {
                        service_name: {S: this.serviceName},
                        sk: {S: "user#29ad13ba-ceca-4141-95d7-e376b0ca4688"},
                        role: {S: "admin"},
                        pk: {S: "service#277619fe-c056-45be-bc2a-43310613913c"},
                        data: {S: "john.watts@digital.cabinet-office.gov.uk"}
                    }
                ]
            }
        } as AxiosResponse);
    }

    listClients(serviceId: string, accessToken: string): Promise<AxiosResponse<QueryCommandOutput>> {
        return Promise.resolve({
            data: {
                Items: [
                    {
                        service_name: {S: this.serviceName || "Test service"},
                        post_logout_redirect_uris: {L: [{S: "http://localhost/"}, {S: "http://localhost/logged_out"}]},
                        subject_type: {S: "pairwise"},
                        contacts: {L: [{S: "john.watts@digital.cabinet-office.gov.uk"}, {S: "onboarding@digital.cabinet-office.gov.uk"}]},
                        public_key: {
                            S: this.publicKey
                        },
                        scopes: {L: [{S: "openid"}]},
                        clientId: {S: "P0_ZdXojEGDlaZEU8Q9Zlv-fo1s"},
                        default_fields: {
                            L: [
                                {S: "data"},
                                {S: "public_key"},
                                {S: "redirect_uris"},
                                {S: "scopes"},
                                {S: "post_logout_redirect_uris"},
                                {S: "subject_type"},
                                {S: "service_type"}
                            ]
                        },
                        data: {S: "SAM Service as a Service Service"},
                        redirect_uris: {L: [{S: "http:/localhost/"}, {S: "http:/localhost/logged-in"}]},
                        sk: {S: "client#d61db4f3-7403-431d-9ead-14cc96476ce4"},
                        pk: {S: "service#277619fe-c056-45be-bc2a-43310613913c"},
                        service_type: {S: "MANDATORY"},
                        type: {S: "integration"}
                    }
                ]
            }
        } as AxiosResponse);
    }

    updateUser(selfServiceUserId: string, updates: Updates, accessToken: string): Promise<AxiosResponse> {
        Object.keys(updates).forEach(key => (this.user[key as keyof DynamoUser] = {S: updates[key] as string}));
        return Promise.resolve({} as AxiosResponse);
    }

    privateBetaRequest(
        name: string,
        department: string,
        serviceName: string,
        emailAddress: string,
        accessToken: string
    ): Promise<AxiosResponse> {
        return Promise.resolve({} as AxiosResponse);
    }
}

export const lambdaFacadeInstance = new StubLambdaFacade();
