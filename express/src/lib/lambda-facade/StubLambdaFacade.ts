import {AxiosResponse} from "axios";
import {OnboardingTableItem} from "../../../@types/OnboardingTableItem";
import {Service} from "../../../@types/Service";
import {User} from "../../../@types/User";
import LambdaFacadeInterface from "./LambdaFacadeInterface";

class StubLambdaFacade implements LambdaFacadeInterface {
    constructor() {
        console.log("Creating stub lambda facade");
    }

    getUserByCognitoId(cognitoId: string, accessToken: string): Promise<AxiosResponse> {
        return Promise.resolve({
            data: {
                Items: [
                    {
                        last_name: {S: "we haven't collected this last name"},
                        data: {S: "we haven't collected this full name"},
                        first_name: {S: "we haven't collected this first name"},
                        password_last_updated: {S: "2022-08-04T13:42:00.821Z"},
                        sk: {S: "cognito_username#29ad13ba-ceca-4141-95d7-e376b0ca4688"},
                        email: {S: "registered@gds.gov.uk"},
                        pk: {S: "user#2c677c1a-22a8-4efa-a01f-9656acbbf5ee"},
                        phone: {S: "07700 987 654"}
                    }
                ]
            }
        } as AxiosResponse);
    }

    newService(service: Service, user: User, accessToken: string): Promise<AxiosResponse> {
        return Promise.resolve({data: {output: JSON.stringify({serviceId: "stub-service-id"})}} as AxiosResponse);
    }

    putUser(user: OnboardingTableItem, accessToken: string): Promise<AxiosResponse> {
        return Promise.resolve({} as AxiosResponse);
    }

    generateClient(serviceId: string, service: Service, contactEmail: string, accessToken: string): Promise<AxiosResponse> {
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
        updates: object,
        accessToken: string
    ): Promise<AxiosResponse> {
        return Promise.resolve({} as AxiosResponse);
    }

    listServices(userId: string, accessToken: string): Promise<AxiosResponse> {
        return Promise.resolve({
            data: {
                Items: [
                    {
                        service_name: {S: "SAM Stacks Service"},
                        sk: {S: "user#257d5399-1b6b-45c0-a894-8bc37b71c6c6"},
                        role: {S: "admin"},
                        pk: {S: "service#277619fe-c056-45be-bc2a-43310613913c"},
                        data: {S: "john.watts@digital.cabinet-office.gov.uk"}
                    },
                    {
                        service_name: {S: "I doubt this flies"},
                        sk: {S: "user#257d5399-1b6b-45c0-a894-8bc37b71c6c6"},
                        role: {S: "admin"},
                        pk: {S: "service#3523fd0f-90c1-4fd2-b08d-a0844b6ec396"},
                        data: {S: "john.watts@digital.cabinet-office.gov.uk"}
                    }
                ]
            }
        } as AxiosResponse);
    }

    listClients(serviceId: string, accessToken: string): Promise<AxiosResponse> {
        return Promise.resolve({
            data: {
                Items: [
                    {
                        service_name: {S: "SAM Stacks Service"},
                        post_logoout_redirect_uris: {L: [{S: "http://localhost/"}, {S: "http://localhost/logged_out"}]},
                        post_logout_redirect_uris: {L: [{S: "http://localhost/logged_out"}]},
                        subject_type: {S: "pairwise"},
                        contacts: {L: [{S: "john.watts@digital.cabinet-office.gov.uk"}, {S: "onboarding@digital.cabinet-office.gov.uk"}]},
                        public_key: {
                            S: "MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEAp2mLkQGo24Kz1rut0oZlviMkGomlQCH+iT1pFvegZFXq39NPjRWyatmXp/XIUPqCq9Kk8/+tq4Sgjw+EM5tATJ06j5r+35of58ATGVPniW//IhGizrv6/ebGcGEUJ0Y/ZmlCHYPV+lbewpttQ/IYKM1nr3k/Rl6qepbVYe+MpGubluQvdhgUYel9OzxiOvUk7XI0axPquiXzoEgmNNOai8+WhYTkBqE3/OucAv+XwXdnx4XHmKzMwTv93dYMpUmvTxWcSeEJ/4/SrbiK4PyHWVKU2BozfSUejVNhahAzZeyyDwhYJmhBaZi/3eOXlqGXj9UdkOXbl3vcwBH8wD30O9/4F5ERLKxzOaMnKZ+RpnygWF0qFhf+UeFMy+O06sdgiaFnXaSCsIy/SohspkKiLjNnhvrDNmPLMQbQKQlJdcpAzUzI7Gzys7luEmOxyMpA32lDBQcjL7KNwM15s4ytfrJ46XEPZUYYYce2gj6NazcPPsrTa/Q2+oLS9GWupGh7AgMBEEE=\r\n"
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

    updateUser(selfServiceUserId: string, cognitoUserId: string, updates: object, accessToken: string): Promise<AxiosResponse> {
        return Promise.resolve({} as AxiosResponse);
    }
}

export const lambdaFacadeInstance = new StubLambdaFacade();
