import LambdaFacade from "../../../src/services/lambda-facade/StubLambdaFacade";

describe("Lambda Facade class tests", () => {
    it("Exercise mock listClients method", async () => {
        const mockLambdaFacade = new LambdaFacade();

        const expected = {
            data: {
                Items: [
                    {
                        back_channel_logout_uri: {S: []},
                        claims: {L: []},
                        clientId: {S: "P0_ZdXojEGDlaZEU8Q9Zlv-fo1s"},
                        client_locs: {L: [{S: "P2"}]},
                        contacts: {L: [{S: "registered@test.gov.uk"}, {S: "mockuser2@gov.uk"}, {S: "mockuser3@gov.uk"}]},
                        data: {S: "SAM Service as a Service Service"},
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
                                {S: "identity_verification_enabled"},
                                {S: "service_type"},
                                {S: "client_locs"},
                                {S: "id_token_signing_algorithm"}
                            ]
                        },
                        id_token_signing_algorithm: {S: "ES256"},
                        identity_verification_enabled: {S: false},
                        pk: {S: "service#277619fe-c056-45be-bc2a-43310613913c"},
                        post_logout_redirect_uris: {L: []},
                        public_key: {
                            S: "MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEAp2mLkQGo24Kz1rut0oZlviMkGomlQCH+iT1pFvegZFXq39NPjRWyatmXp/XIUPqCq9Kk8/+tq4Sgjw+EM5tATJ06j5r+35of58ATGVPniW//IhGizrv6/ebGcGEUJ0Y/ZmlCHYPV+lbewpttQ/IYKM1nr3k/Rl6qepbVYe+MpGubluQvdhgUYel9OzxiOvUk7XI0axPquiXzoEgmNNOai8+WhYTkBqE3/OucAv+XwXdnx4XHmKzMwTv93dYMpUmvTxWcSeEJ/4/SrbiK4PyHWVKU2BozfSUejVNhahAzZeyyDwhYJmhBaZi/3eOOlqGXj9UdkOXbl3vcwBH8wD30O9/4F5ERLKxzOaMnKZ+RpnygWF0qFhf+UeFMy+O06sdgiaFnXaSCsIy/SohspkKiLjNnhvrDNmPLMQbQKQlJdcp6zUzI7Gzys7luEmOxyMpA32lDBQcjL7KNwM15s4ytfrJ46XEPZUXESce2gj6NazcPPsrTa/Q2+oLS9GWupGh7AgMBAAE="
                        },
                        redirect_uris: {L: [{S: "http://localhost/"}]},
                        scopes: {L: [{S: "openid"}]},
                        sector_identifier_uri: {S: "http://gov.uk"},
                        service_name: {S: "Test Service"},
                        service_type: {S: "MANDATORY"},
                        sk: {S: "client#d61db4f3-7403-431d-9ead-14cc96476ce4"},
                        subject_type: {S: "pairwise"},
                        token_endpoint_auth_method: {S: "private_key_jwt"},
                        type: {S: "integration"}
                    }
                ]
            }
        };
        const result = await mockLambdaFacade.listClients();
        expect(result).toEqual(expected);
    });

    it("Exercise mock listServices method", async () => {
        const mockLambdaFacade = new LambdaFacade();

        const expected = {
            data: {
                Items: [
                    {
                        service_name: {S: "Test Service"},
                        sk: {S: "user#29ad13ba-ceca-4141-95d7-e376b0ca4688"},
                        role: {S: "admin"},
                        pk: {S: "service#277619fe-c056-45be-bc2a-43310613913c"},
                        data: {S: "john.watts@test.gov.uk"}
                    }
                ]
            }
        };
        const result = await mockLambdaFacade.listServices();
        expect(result).toEqual(expected);
    });

    it("Exercise mock updateClient method", async () => {
        const mockLambdaFacade = new LambdaFacade();

        const update: Record<string, string | string[]> = {};
        const result = await mockLambdaFacade.updateClient("", "", "", update);
        expect(result).toBeUndefined();
    });
});
