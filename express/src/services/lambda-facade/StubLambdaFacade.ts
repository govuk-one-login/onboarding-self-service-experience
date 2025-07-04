import {QueryCommandOutput} from "@aws-sdk/client-dynamodb";
import {convertToAttr} from "@aws-sdk/util-dynamodb";
import {AxiosResponse} from "axios";
import {Service} from "../../../@types/Service";
import {DynamoUser} from "../../../@types/user";
import LambdaFacadeInterface, {ClientUpdates, ServiceNameUpdates, UserUpdates} from "./LambdaFacadeInterface";
import console from "console";
import {TxMAEvent} from "../../types/txma-event";

const defaultPublicKey =
    "MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEAp2mLkQGo24Kz1rut0oZlviMkGomlQCH+iT1pFvegZFXq39NPjRWyatmXp/XIUPqCq9Kk8/+tq4Sgjw+EM5tATJ06j5r+35of58ATGVPniW//IhGizrv6/ebGcGEUJ0Y/ZmlCHYPV+lbewpttQ/IYKM1nr3k/Rl6qepbVYe+MpGubluQvdhgUYel9OzxiOvUk7XI0axPquiXzoEgmNNOai8+WhYTkBqE3/OucAv+XwXdnx4XHmKzMwTv93dYMpUmvTxWcSeEJ/4/SrbiK4PyHWVKU2BozfSUejVNhahAzZeyyDwhYJmhBaZi/3eOOlqGXj9UdkOXbl3vcwBH8wD30O9/4F5ERLKxzOaMnKZ+RpnygWF0qFhf+UeFMy+O06sdgiaFnXaSCsIy/SohspkKiLjNnhvrDNmPLMQbQKQlJdcp6zUzI7Gzys7luEmOxyMpA32lDBQcjL7KNwM15s4ytfrJ46XEPZUXESce2gj6NazcPPsrTa/Q2+oLS9GWupGh7AgMBAAE=";

export default class StubLambdaFacade implements LambdaFacadeInterface {
    private publicKey = defaultPublicKey;
    private serviceName = "Test Service";
    private redirectUris = ["http://localhost/"];
    private postLogoutRedirectUris = [];
    private scopes = ["openid"];
    private backChannelLogoutUri = [];
    private sectorIdentifierUri = "http://gov.uk";
    private contacts = ["registered@test.gov.uk", "mockuser2@gov.uk", "mockuser3@gov.uk"];
    private claims: string[] = [];
    private identityVerificationSupported = false;
    private client_locs = ["P2"];
    private id_token_signing_algorithm = "ES256";
    private maxAgeEnabled = false;
    private pkceEnforced = false;
    private landingPageUrl: string | null = null;

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

        if (updates.contacts) {
            this.contacts = updates.contacts as string[];
        }

        if (updates.post_logout_redirect_uris) {
            this.postLogoutRedirectUris = updates.post_logout_redirect_uris as [];
        }

        if (updates.scopes) {
            this.scopes = updates.scopes as string[];
        }

        if (updates.back_channel_logout_uri) {
            this.backChannelLogoutUri = updates.back_channel_logout_uri as [];
        }

        if (updates.sector_identifier_uri) {
            this.sectorIdentifierUri = updates.sector_identifier_uri as string;
        }

        if (updates.claims) {
            this.claims = updates.claims as string[];
        }

        if (typeof updates.identity_verification_supported !== "undefined") {
            this.identityVerificationSupported = updates.identity_verification_supported as boolean;
        }

        if (updates.id_token_signing_algorithm) {
            this.id_token_signing_algorithm = updates.id_token_signing_algorithm as string;
        }

        if (typeof updates.max_age_enabled !== "undefined") {
            this.maxAgeEnabled = updates.max_age_enabled as boolean;
        }

        if (typeof updates.pkce_enforced !== "undefined") {
            this.pkceEnforced = updates.pkce_enforced as boolean;
        }

        if (updates.landing_page_url) {
            this.landingPageUrl = updates.landing_page_url as string;
        }
    }

    async updateService(serviceId: string, selfServiceClientId: string, clientId: string, updates: ServiceNameUpdates): Promise<void> {
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
                        sector_identifier_uri: {S: this.sectorIdentifierUri},
                        back_channel_logout_uri: {S: this.backChannelLogoutUri},
                        subject_type: {S: "pairwise"},
                        contacts: convertToAttr(this.contacts),
                        client_locs: {L: [{S: this.client_locs[0]}]},
                        id_token_signing_algorithm: {S: this.id_token_signing_algorithm},
                        public_key: {
                            S: this.publicKey
                        },
                        scopes: convertToAttr(this.scopes),
                        claims: convertToAttr(this.claims),
                        clientId: {S: "P0_ZdXojEGDlaZEU8Q9Zlv-fo1s"},
                        default_fields: {
                            L: [
                                {S: "data"},
                                {S: "public_key"},
                                {S: "redirect_uris"},
                                {S: "scopes"},
                                {S: "contacts"},
                                {S: "post_logout_redirect_uris"},
                                {S: "sector_identifier_uri"},
                                {S: "back_channel_logout_uri"},
                                {S: "subject_type"},
                                {S: "service_type"},
                                {S: "claims"},
                                {S: "identity_verification_supported"},
                                {S: "client_locs"},
                                {S: "id_token_signing_algorithm"},
                                {S: "max_age_enabled"},
                                {S: "pkce_enforced"}
                            ]
                        },
                        data: {S: "SAM Service as a Service Service"},
                        redirect_uris: convertToAttr(this.redirectUris),
                        token_endpoint_auth_method: {S: "private_key_jwt"},
                        sk: {S: "client#d61db4f3-7403-431d-9ead-14cc96476ce4"},
                        pk: {S: "service#277619fe-c056-45be-bc2a-43310613913c"},
                        service_type: {S: "MANDATORY"},
                        type: {S: "integration"},
                        identity_verification_supported: {S: this.identityVerificationSupported},
                        maxAgeEnabled: {S: this.maxAgeEnabled},
                        pkce_enforced: {S: this.pkceEnforced},
                        ...(this.landingPageUrl && {landing_page_url: {S: this.landingPageUrl}})
                    }
                ]
            }
        } as AxiosResponse);
    }

    async deleteClientEntries(oldUserID: string, serviceID: string): Promise<void> {
        console.log("Stubbing Deletion of Client Entries for:  Client ID =>" + oldUserID + ", ServiceID => " + serviceID);
        return;
    }

    async deleteServiceEntries(serviceID: string): Promise<void> {
        console.log("Stubbing Deletion of Service Entries for: ServiceID => " + serviceID);
        return;
    }

    async getDynamoDBEntries(): Promise<AxiosResponse> {
        return Promise.resolve({
            status: 200
        } as AxiosResponse);
    }

    async updateUser(selfServiceUserId: string, updates: UserUpdates): Promise<void> {
        Object.keys(updates).forEach(key => (this.user[key as keyof DynamoUser] = {S: updates[key] as string}));
    }

    async sendTxMALog(message: TxMAEvent): Promise<void> {
        console.log(JSON.stringify(message));
        return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getEmailCodeBlock(_email: string): Promise<boolean> {
        return false;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async putEmailCodeBlock(_e: string): Promise<void> {
        return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async removeEmailCodeBlock(_e: string): Promise<void> {
        return;
    }
}
