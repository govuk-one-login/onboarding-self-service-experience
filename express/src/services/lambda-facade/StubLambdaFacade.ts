import {QueryCommandOutput} from "@aws-sdk/client-dynamodb";
import {convertToAttr} from "@aws-sdk/util-dynamodb";
import {AxiosResponse} from "axios";
import {Service} from "../../../@types/Service";
import {DynamoUser} from "../../../@types/user";
import LambdaFacadeInterface, {ClientUpdates, ServiceNameUpdates, UserUpdates} from "./LambdaFacadeInterface";
import console from "console";

const defaultPublicKey =
    "MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEAp2mLkQGo24Kz1rut0oZlviMkGomlQCH+iT1pFvegZFXq39NPjRWyatmXp/XIUPqCq9Kk8/+tq4Sgjw+EM5tATJ06j5r+35of58ATGVPniW//IhGizrv6/ebGcGEUJ0Y/ZmlCHYPV+lbewpttQ/IYKM1nr3k/Rl6qepbVYe+MpGubluQvdhgUYel9OzxiOvUk7XI0axPquiXzoEgmNNOai8+WhYTkBqE3/OucAv+XwXdnx4XHmKzMwTv93dYMpUmvTxWcSeEJ/4/SrbiK4PyHWVKU2BozfSUejVNhahAzZeyyDwhYJmhBaZi/3eOOlqGXj9UdkOXbl3vcwBH8wD30O9/4F5ERLKxzOaMnKZ+RpnygWF0qFhf+UeFMy+O06sdgiaFnXaSCsIy/SohspkKiLjNnhvrDNmPLMQbQKQlJdcp6zUzI7Gzys7luEmOxyMpA32lDBQcjL7KNwM15s4ytfrJ46XEPZUXESce2gj6NazcPPsrTa/Q2+oLS9GWupGh7AgMBAAE=";

export default class StubLambdaFacade implements LambdaFacadeInterface {
    private publicKey = defaultPublicKey;
    private serviceName = "Test Service";
    private redirectUris = ["http://localhost/"];
    private postLogoutRedirectUris = ["http://localhost/", "http://localhost/logged_out"];
    private scopes = ["openid"];

    private user: DynamoUser = {
        last_name: {S: "we haven't collected this last name"},
        data: {S: "we haven't collected this full name"},
        first_name: {S: "we haven't collected this first name"},
        password_last_updated: {S: "2022-08-04T13:42:00.821Z"},
        sk: {S: "user#29ad13ba-ceca-4141-95d7-e376b0ca4688"},
        email: {S: "registered@gds.gov.uk"},
        pk: {S: "user#29ad13ba-ceca-4141-95d7-e376b0ca4688"},
        phone: {S: "07700 987 654"}
    };

    constructor() {
        console.log("Creating stub Lambda facade...");
    }

    getUserByCognitoId(): Promise<AxiosResponse> {
        return Promise.resolve({
            data: {
                Item: this.user
            }
        } as AxiosResponse);
    }

    async newService(service: Service): Promise<void> {
        this.serviceName = service.serviceName;
    }

    async putUser(): Promise<void> {
        return;
    }

    generateClient(): Promise<AxiosResponse> {
        return Promise.resolve({
            data: {
                output: JSON.stringify({body: JSON.stringify({pk: "stub-service-id"})})
            }
        } as AxiosResponse);
    }

    async updateClient(serviceId: string, selfServiceClientId: string, clientId: string, updates: ClientUpdates): Promise<void> {
        if (updates.public_key) {
            this.publicKey = updates.public_key as string;
        }

        if (updates.service_name) {
            this.serviceName = updates.service_name as string;
        }

        if (updates.redirect_uris) {
            this.redirectUris = updates.redirect_uris as string[];
        }

        if (updates.post_logout_redirect_uris) {
            this.postLogoutRedirectUris = updates.post_logout_redirect_uris as string[];
        }

        if (updates.scopes) {
            this.scopes = updates.scopes as string[];
        }
    }

    async updateService(serviceId: string, updates: ServiceNameUpdates): Promise<void> {
        if (updates.service_name) {
            this.serviceName = updates.service_name as string;
        }
    }

    listServices(): Promise<AxiosResponse> {
        return Promise.resolve({
            data: {
                Items: [
                    {
                        service_name: {S: this.serviceName},
                        sk: {S: "user#29ad13ba-ceca-4141-95d7-e376b0ca4688"},
                        role: {S: "admin"},
                        pk: {S: "service#277619fe-c056-45be-bc2a-43310613913c"},
                        data: {S: "john.watts@test.gov.uk"}
                    }
                ]
            }
        } as AxiosResponse);
    }

    sessionCount(): Promise<AxiosResponse> {
        return Promise.resolve({
            data: 5
        } as AxiosResponse);
    }

    globalSignOut(): Promise<AxiosResponse> {
        return Promise.resolve({
            status: 200
        } as AxiosResponse);
    }

    listClients(): Promise<AxiosResponse<QueryCommandOutput>> {
        return Promise.resolve({
            data: {
                Items: [
                    {
                        service_name: {S: this.serviceName},
                        post_logout_redirect_uris: convertToAttr(this.postLogoutRedirectUris),
                        subject_type: {S: "pairwise"},
                        contacts: {L: [{S: "john.watts@test.gov.uk"}, {S: "onboarding@test.gov.uk"}]},
                        public_key: {
                            S: this.publicKey
                        },
                        scopes: convertToAttr(this.scopes),
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
                        redirect_uris: convertToAttr(this.redirectUris),
                        sk: {S: "client#d61db4f3-7403-431d-9ead-14cc96476ce4"},
                        pk: {S: "service#277619fe-c056-45be-bc2a-43310613913c"},
                        service_type: {S: "MANDATORY"},
                        type: {S: "integration"}
                    }
                ]
            }
        } as AxiosResponse);
    }

    async updateUser(selfServiceUserId: string, updates: UserUpdates): Promise<void> {
        Object.keys(updates).forEach(key => (this.user[key as keyof DynamoUser] = {S: updates[key] as string}));
    }

    async publicBetaRequest(): Promise<void> {
        return;
    }

    async sendTxMALog(message: string): Promise<void> {
        console.log(message);
        return;
    }
}
