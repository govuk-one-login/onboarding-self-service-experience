const uuidMock = jest.fn();
jest.mock("uuid", () => ({
    v4: uuidMock
}));

const timestampMock = jest.fn();
jest.mock("../../src/lib/timestamp", () => timestampMock);

import SelfServiceServicesService from "../../src/services/self-service-services-service";
import {
    processAddPostLogoutUriForm,
    processAddRedirectUriForm,
    processChangeBackChannelLogOutUriForm,
    processChangePublicKeyForm,
    processChangeSectorIdentifierUriForm,
    processChangeServiceNameForm,
    processChangeUserAttributesForm,
    processConfirmContactRemovalForm,
    processEnterContactEmailForm,
    processPublicBetaForm,
    processRemovePostLogoutUriFrom,
    processRemoveRedirectUriFrom,
    showAddPostLogoutUriForm,
    showAddRedirectUriForm,
    showChangeBackChannelLogoutUriForm,
    showChangePostLogoutUrisForm,
    showChangePublicKeyForm,
    showChangeRedirectUrlsForm,
    showChangeSectorIdentifierUriForm,
    showChangeServiceNameForm,
    showChangeUserAttributesForm,
    showClient,
    showConfirmContactRemovalForm,
    showConfirmPostLogoutUriRemovalForm,
    showConfirmRedirectUriRemovalForm,
    showEnterContactEmailForm,
    showEnterContactForm,
    showPublicBetaForm,
    showPublicBetaFormSubmitted
} from "../../src/controllers/clients";
import {
    TEST_AUTHENTICATION_RESULT,
    TEST_BACK_CHANNEL_LOGOUT_URI,
    TEST_CLIENT,
    TEST_CLIENT_ID,
    TEST_COGNITO_ID,
    TEST_DATA_RANGE,
    TEST_EMAIL,
    TEST_FULL_NAME,
    TEST_HEADER_RANGE,
    TEST_IP_ADDRESS,
    TEST_POST_LOGOUT_REDIRECT_URI,
    TEST_PUBLIC_BETA_FORM_SUBMISSION,
    TEST_PUBLIC_KEY,
    TEST_REDIRECT_URI,
    TEST_SECTOR_IDENTIFIER_URI,
    TEST_SELF_SERVICE_CLIENT_ID,
    TEST_SERVICE_ID,
    TEST_SERVICE_NAME,
    TEST_SESSION_ID,
    TEST_TIMESTAMP,
    TEST_TIMESTAMP_STRING,
    TEST_USER_ATTRIBUTES,
    TEST_UUID
} from "../constants";
import {request, response} from "../mocks";
import SheetsService from "../../src/lib/sheets/SheetsService";
import AuthenticationResultParser from "../../src/lib/authentication-result-parser";

const s4ListClientsSpy = jest.spyOn(SelfServiceServicesService.prototype, "listClients");
const s4SendTxmaLogSpy = jest.spyOn(SelfServiceServicesService.prototype, "sendTxMALog");
const s4UpdateServiceSpy = jest.spyOn(SelfServiceServicesService.prototype, "updateService");
const s4UpdateClientSpy = jest.spyOn(SelfServiceServicesService.prototype, "updateClient");
const sheetsAppendValueSpy = jest.spyOn(SheetsService.prototype, "appendValues");
const sheetsInitSpy = jest.spyOn(SheetsService.prototype, "init");
jest.spyOn(AuthenticationResultParser, "getCognitoId").mockReturnValue(TEST_COGNITO_ID);
timestampMock.mockReturnValue(TEST_TIMESTAMP_STRING);

const mockNext = jest.fn();

describe("showClient Controller tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("calls render with the expected template and options from the first client returned from s4 listClients", async () => {
        s4ListClientsSpy.mockResolvedValue([TEST_CLIENT]);

        const mockRequest = request({
            context: {
                serviceId: TEST_SERVICE_ID
            },
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT
            }
        });
        const mockResponse = response();

        await showClient(mockRequest, mockResponse, mockNext);

        expect(s4ListClientsSpy).toHaveBeenCalledWith(TEST_SERVICE_ID, TEST_AUTHENTICATION_RESULT.AccessToken);
        expect(mockResponse.render).toHaveBeenCalledWith("clients/client-details.njk", {
            clientId: TEST_CLIENT.authClientId,
            selfServiceClientId: TEST_CLIENT.dynamoServiceId,
            serviceId: TEST_SERVICE_ID,
            serviceName: TEST_CLIENT.serviceName,
            updatedField: undefined,
            redirectUris: TEST_CLIENT.redirectUris,
            userAttributesRequired: TEST_CLIENT.scopes,
            userPublicKey: TEST_CLIENT.publicKey,
            backChannelLogoutUri: TEST_CLIENT.back_channel_logout_uri,
            sectorIdentifierUri: TEST_CLIENT.sector_identifier_uri,
            postLogoutRedirectUris: TEST_CLIENT.postLogoutUris,
            claims: TEST_CLIENT.claims,
            id_token_signing_algorithm: TEST_CLIENT.id_token_signing_algorithm,
            contacts: TEST_CLIENT.contacts,
            token_endpoint_auth_method: TEST_CLIENT.token_endpoint_auth_method,
            urls: {
                changeClientName: `/test/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${
                    TEST_CLIENT.dynamoServiceId
                }/change-client-name?clientName=${encodeURIComponent(TEST_CLIENT.clientName)}`,
                changeRedirectUris: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/change-redirect-uris`,
                changeUserAttributes: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${
                    TEST_CLIENT.dynamoServiceId
                }/change-user-attributes?userAttributes=${encodeURIComponent(TEST_CLIENT.scopes.join(" "))}`,
                changePublicKey: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${
                    TEST_CLIENT.dynamoServiceId
                }/change-public-key?publicKey=${encodeURIComponent(TEST_CLIENT.publicKey)}`,
                changePostLogoutUris: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/change-post-logout-uris`,
                changeBackChannelLogoutUri: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${
                    TEST_CLIENT.dynamoServiceId
                }/change-back-channel-logout-uri?backChannelLogoutUri=${encodeURIComponent(TEST_CLIENT.back_channel_logout_uri as string)}`,
                changeSectorIdentifierUri: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${
                    TEST_CLIENT.dynamoServiceId
                }/change-sector-identifier-uri?sectorIdentifierUri=${encodeURIComponent(TEST_CLIENT.sector_identifier_uri)}`,
                changeContacts: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/enter-contact`
            }
        });
        expect(mockRequest.session.serviceName).toStrictEqual(TEST_CLIENT.serviceName);
        expect(mockRequest.session.updatedField).toBeUndefined();
    });

    it("includes client_secret in the render options if the token_endpoint_auth_method is client_secret_post", async () => {
        s4ListClientsSpy.mockResolvedValue([{...TEST_CLIENT, token_endpoint_auth_method: "client_secret_post"}]);

        const mockRequest = request({
            context: {
                serviceId: TEST_SERVICE_ID
            },
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT
            }
        });
        const mockResponse = response();

        await showClient(mockRequest, mockResponse, mockNext);

        expect(s4ListClientsSpy).toHaveBeenCalledWith(TEST_SERVICE_ID, TEST_AUTHENTICATION_RESULT.AccessToken);
        expect(mockResponse.render).toHaveBeenCalledWith("clients/client-details.njk", {
            clientId: TEST_CLIENT.authClientId,
            selfServiceClientId: TEST_CLIENT.dynamoServiceId,
            serviceId: TEST_SERVICE_ID,
            serviceName: TEST_CLIENT.serviceName,
            updatedField: undefined,
            redirectUris: TEST_CLIENT.redirectUris,
            userAttributesRequired: TEST_CLIENT.scopes,
            client_secret: TEST_CLIENT.client_secret,
            backChannelLogoutUri: TEST_CLIENT.back_channel_logout_uri,
            sectorIdentifierUri: TEST_CLIENT.sector_identifier_uri,
            postLogoutRedirectUris: TEST_CLIENT.postLogoutUris,
            claims: TEST_CLIENT.claims,
            id_token_signing_algorithm: TEST_CLIENT.id_token_signing_algorithm,
            contacts: TEST_CLIENT.contacts,
            token_endpoint_auth_method: "client_secret_post",
            urls: {
                changeClientName: `/test/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${
                    TEST_CLIENT.dynamoServiceId
                }/change-client-name?clientName=${encodeURIComponent(TEST_CLIENT.clientName)}`,
                changeRedirectUris: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/change-redirect-uris`,
                changeUserAttributes: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${
                    TEST_CLIENT.dynamoServiceId
                }/change-user-attributes?userAttributes=${encodeURIComponent(TEST_CLIENT.scopes.join(" "))}`,
                changePublicKey: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${
                    TEST_CLIENT.dynamoServiceId
                }/change-public-key?publicKey=${encodeURIComponent(TEST_CLIENT.publicKey)}`,
                changePostLogoutUris: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/change-post-logout-uris`,
                changeBackChannelLogoutUri: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${
                    TEST_CLIENT.dynamoServiceId
                }/change-back-channel-logout-uri?backChannelLogoutUri=${encodeURIComponent(TEST_CLIENT.back_channel_logout_uri as string)}`,
                changeSectorIdentifierUri: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${
                    TEST_CLIENT.dynamoServiceId
                }/change-sector-identifier-uri?sectorIdentifierUri=${encodeURIComponent(TEST_CLIENT.sector_identifier_uri)}`,
                changeContacts: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/enter-contact`
            }
        });
        expect(mockRequest.session.serviceName).toStrictEqual(TEST_CLIENT.serviceName);
        expect(mockRequest.session.updatedField).toBeUndefined();
    });
});

describe("showPublicBetaForm controller tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("calls render with the expected template path and render options", () => {
        const mockRequest = request({
            context: {
                serviceId: TEST_SERVICE_ID
            },
            session: {
                serviceName: TEST_SERVICE_NAME,
                emailAddress: TEST_EMAIL
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            }
        });
        const mockResponse = response();

        showPublicBetaForm(mockRequest, mockResponse, mockNext);

        expect(mockResponse.render).toHaveBeenCalledWith("clients/public-beta.njk", {
            serviceId: TEST_SERVICE_ID,
            selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
            clientId: TEST_CLIENT_ID,
            serviceName: TEST_SERVICE_NAME,
            emailAddress: TEST_EMAIL
        });
    });
});

describe("processPublicBetaForm controller tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        uuidMock.mockReturnValue(TEST_UUID);
        jest.useFakeTimers().setSystemTime(TEST_TIMESTAMP);
        process.env.PUBLIC_BETA_SHEET_DATA_RANGE = TEST_DATA_RANGE;
        process.env.PUBLIC_BETA_SHEET_HEADER_RANGE = TEST_HEADER_RANGE;
    });

    afterEach(() => {
        delete process.env.PUBLIC_BETA_SHEET_DATA_RANGE;
        delete process.env.PUBLIC_BETA_SHEET_DATA_RANGE;
        jest.useRealTimers();
    });

    it.each([
        {
            missingFieldKey: "userName",
            formSubmission: {...TEST_PUBLIC_BETA_FORM_SUBMISSION, userName: ""},
            errorMessages: new Map<string, string>().set("userName", "Enter your name")
        },
        {
            missingFieldKey: "organisationName",
            formSubmission: {...TEST_PUBLIC_BETA_FORM_SUBMISSION, organisationName: ""},
            errorMessages: new Map<string, string>().set("organisationName", "Enter your organisation name")
        },
        {
            missingFieldKey: "serviceUse",
            formSubmission: {...TEST_PUBLIC_BETA_FORM_SUBMISSION, serviceUse: ""},
            errorMessages: new Map<string, string>().set("serviceUse-options", "Service use is required")
        },
        {
            missingFieldKey: "migrateExistingAccounts",
            formSubmission: {...TEST_PUBLIC_BETA_FORM_SUBMISSION, migrateExistingAccounts: ""},
            errorMessages: new Map<string, string>().set("migrateExistingAccounts-options", "Migration of existing accounts is required")
        }
    ])(
        "renders the public beta form template with error messages when $missingFieldKey is missing ",
        async ({formSubmission, errorMessages}) => {
            const mockRequest = request({
                body: formSubmission,
                session: {
                    emailAddress: TEST_EMAIL,
                    id: TEST_SESSION_ID
                },
                context: {
                    serviceId: TEST_SERVICE_ID
                },
                params: {
                    selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                    clientId: TEST_CLIENT_ID
                },
                ip: TEST_IP_ADDRESS
            });
            const mockResponse = response();
            await processPublicBetaForm(mockRequest, mockResponse, mockNext);
            expect(mockResponse.render).toHaveBeenCalledWith("clients/public-beta.njk", {
                serviceId: TEST_SERVICE_ID,
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID,
                serviceName: TEST_SERVICE_NAME,
                emailAddress: TEST_EMAIL,
                errorMessages: Object.fromEntries(errorMessages),
                values: formSubmission
            });
        }
    );

    it("calls the sheets service with the expected values and then redirects to the successfully submitted page", async () => {
        sheetsInitSpy.mockResolvedValue();
        sheetsAppendValueSpy.mockResolvedValue();
        s4SendTxmaLogSpy.mockReturnValue();

        const mockRequest = request({
            body: TEST_PUBLIC_BETA_FORM_SUBMISSION,
            session: {
                emailAddress: TEST_EMAIL,
                authenticationResult: TEST_AUTHENTICATION_RESULT,
                id: TEST_SESSION_ID
            },
            context: {
                serviceId: TEST_SERVICE_ID
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            ip: TEST_IP_ADDRESS
        });
        const mockResponse = response();
        const expectedValuesToAppend = new Map(
            Object.entries({
                userName: TEST_FULL_NAME,
                role: "Testing",
                organisationName: "Test",
                serviceUrl: "test.gov.uk",
                serviceDescription: "Some users for stuff",
                serviceUse: "To sign users in and check their identity",
                migrateExistingAccounts: "Yes",
                numberOfUsersEachYear: "Over 1 million users",
                "targetDate-day": "12",
                "targetDate-month": "12",
                "targetDate-year": "1212",
                serviceName: "someTestService",
                id: TEST_UUID,
                "submission-date": TEST_TIMESTAMP_STRING,
                email: TEST_EMAIL,
                estimatedServiceGoLiveDate: "12/12/1212"
            })
        );

        await processPublicBetaForm(mockRequest, mockResponse, mockNext);

        expect(sheetsInitSpy).toHaveBeenCalled();
        expect(sheetsAppendValueSpy).toHaveBeenCalledWith(expectedValuesToAppend, TEST_DATA_RANGE, TEST_HEADER_RANGE);
        expect(s4SendTxmaLogSpy).toHaveBeenCalledWith(
            "SSE_PUBLIC_BETA_FORM_SUBMITTED",
            {
                session_id: TEST_SESSION_ID,
                ip_address: TEST_IP_ADDRESS,
                user_id: TEST_COGNITO_ID
            },
            {
                service_id: TEST_SERVICE_ID
            }
        );
        expect(mockResponse.redirect).toHaveBeenCalledWith(
            `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT_ID}/${TEST_SELF_SERVICE_CLIENT_ID}/public-beta/submitted`
        );
    });
});

describe("showPublicBetaFormSubmitted controller tests", () => {
    it("calls render with the expected values", () => {
        const mockReq = request({
            context: {
                serviceId: TEST_SERVICE_ID
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            }
        });
        const mockRes = response();

        showPublicBetaFormSubmitted(mockReq, mockRes, mockNext);

        expect(mockRes.render).toHaveBeenCalledWith("clients/public-beta-form-submitted.njk", {
            serviceId: TEST_SERVICE_ID,
            selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
            clientId: TEST_CLIENT_ID
        });
    });
});

describe("showChangeServiceNameForm controller tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("calls render with the expected values", () => {
        const mockReq = request({
            context: {
                serviceId: TEST_SERVICE_ID
            },
            query: {
                serviceName: TEST_SERVICE_NAME
            }
        });
        const mockRes = response();

        showChangeServiceNameForm(mockReq, mockRes, mockNext);

        expect(mockRes.render).toHaveBeenCalledWith("clients/change-service-name.njk", {
            serviceId: TEST_SERVICE_ID,
            values: {
                serviceName: TEST_SERVICE_NAME
            }
        });
    });
});

describe("processChangeServiceNameForm controller tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("calls render with the change-service-name template and error message if service name is empty", async () => {
        const mockRequest = request({
            context: {
                serviceId: TEST_SERVICE_ID
            },
            body: {
                serviceName: ""
            }
        });
        const mockResponse = response();
        await processChangeServiceNameForm(mockRequest, mockResponse, mockNext);
        expect(mockResponse.render).toHaveBeenCalledWith("clients/change-service-name.njk", {
            serviceId: TEST_SERVICE_ID,
            errorMessages: {
                serviceName: "Enter your service name"
            }
        });
    });

    it("calls s4 update service with the new service name and then sends a txma log and redirects to `/services/${serviceId}/clients", async () => {
        s4UpdateServiceSpy.mockResolvedValue();
        s4SendTxmaLogSpy.mockReturnValue();

        const mockRequest = request({
            context: {
                serviceId: TEST_SERVICE_ID
            },
            body: {
                serviceName: TEST_SERVICE_NAME
            },
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT,
                id: TEST_SESSION_ID
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            ip: TEST_IP_ADDRESS
        });
        const mockResponse = response();

        await processChangeServiceNameForm(mockRequest, mockResponse, mockNext);

        expect(s4UpdateServiceSpy).toHaveBeenCalledWith(
            TEST_SERVICE_ID,
            TEST_SELF_SERVICE_CLIENT_ID,
            TEST_CLIENT_ID,
            {service_name: TEST_SERVICE_NAME},
            TEST_AUTHENTICATION_RESULT.AccessToken
        );
        expect(mockRequest.session.updatedField).toStrictEqual("service name");
        expect(mockRequest.session.serviceName).toStrictEqual(TEST_SERVICE_NAME);
        expect(s4SendTxmaLogSpy).toHaveBeenCalledWith(
            "SSE_UPDATE_SERVICE_NAME",
            {
                session_id: TEST_SESSION_ID,
                ip_address: TEST_IP_ADDRESS,
                user_id: TEST_COGNITO_ID
            },
            {
                service_name: TEST_SERVICE_NAME
            }
        );
        expect(mockResponse.redirect).toHaveBeenCalledWith(`/services/${TEST_SERVICE_ID}/clients`);
    });
});

describe("showChangePublicKeyForm controller tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("calls render with the change-public-key-template and expected options", () => {
        const mockRequest = request({
            context: {
                serviceId: TEST_SERVICE_ID
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            query: {
                publicKey: TEST_PUBLIC_KEY
            }
        });
        const mockResponse = response();

        showChangePublicKeyForm(mockRequest, mockResponse, mockNext);
        expect(mockResponse.render).toHaveBeenCalledWith("clients/change-public-key.njk", {
            serviceId: TEST_SERVICE_ID,
            selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
            clientId: TEST_CLIENT_ID,
            serviceUserPublicKey: TEST_PUBLIC_KEY
        });
    });
});

describe("processChangePublicKeyForm controller tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("calls s4 update client with the new public key and sends a SSE_UPDATE_PUBLIC_KEY log when the selfServiceClientId is not empty", async () => {
        s4UpdateClientSpy.mockResolvedValue();
        s4SendTxmaLogSpy.mockReturnValue();

        const mockRequest = request({
            session: {
                id: TEST_SESSION_ID,
                authenticationResult: TEST_AUTHENTICATION_RESULT
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            body: {
                authCompliantPublicKey: TEST_PUBLIC_KEY
            },
            context: {
                serviceId: TEST_SERVICE_ID
            },
            ip: TEST_IP_ADDRESS
        });
        const mockResponse = response();
        await processChangePublicKeyForm(mockRequest, mockResponse, mockNext);

        expect(s4UpdateClientSpy).toHaveBeenCalledWith(
            TEST_SERVICE_ID,
            TEST_SELF_SERVICE_CLIENT_ID,
            TEST_CLIENT_ID,
            {public_key: TEST_PUBLIC_KEY},
            TEST_AUTHENTICATION_RESULT.AccessToken
        );
        expect(mockRequest.session.updatedField).toEqual("public key");
        expect(s4SendTxmaLogSpy).toHaveBeenCalledWith(
            "SSE_UPDATE_PUBLIC_KEY",
            {
                session_id: TEST_SESSION_ID,
                ip_address: TEST_IP_ADDRESS,
                user_id: TEST_COGNITO_ID
            },
            {
                service_id: TEST_SERVICE_ID
            }
        );
        expect(mockResponse.redirect).toHaveBeenCalledWith(`/services/${TEST_SERVICE_ID}/clients`);
    });

    it("calls s4 update client with the new public key and sends a SSE_PUBLIC_KEY_ADDED log when the selfServiceClientId is empty", async () => {
        s4UpdateClientSpy.mockResolvedValue();
        s4SendTxmaLogSpy.mockReturnValue();

        const mockRequest = request({
            session: {
                id: TEST_SESSION_ID,
                authenticationResult: TEST_AUTHENTICATION_RESULT
            },
            params: {
                selfServiceClientId: "",
                clientId: TEST_CLIENT_ID
            },
            body: {
                authCompliantPublicKey: TEST_PUBLIC_KEY
            },
            context: {
                serviceId: TEST_SERVICE_ID
            },
            ip: TEST_IP_ADDRESS
        });
        const mockResponse = response();
        await processChangePublicKeyForm(mockRequest, mockResponse, mockNext);

        expect(s4UpdateClientSpy).toHaveBeenCalledWith(
            TEST_SERVICE_ID,
            "",
            TEST_CLIENT_ID,
            {public_key: TEST_PUBLIC_KEY},
            TEST_AUTHENTICATION_RESULT.AccessToken
        );
        expect(mockRequest.session.updatedField).toEqual("public key");

        expect(s4SendTxmaLogSpy).toHaveBeenCalledWith(
            "SSE_PUBLIC_KEY_ADDED",
            {
                session_id: TEST_SESSION_ID,
                ip_address: TEST_IP_ADDRESS,
                user_id: TEST_COGNITO_ID
            },
            {
                service_id: TEST_SERVICE_ID
            }
        );
        expect(mockResponse.redirect).toHaveBeenCalledWith(`/services/${TEST_SERVICE_ID}/clients`);
    });
});

describe("showChangeRedirectUrlsForm controller tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("calls s4 list client and renders the change redirect uris template with the expected values", async () => {
        s4ListClientsSpy.mockResolvedValue([TEST_CLIENT]);

        const mockRequest = request({
            context: {
                serviceId: TEST_SERVICE_ID
            },
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            query: {
                updateResult: null
            }
        });
        const mockResponse = response();

        await showChangeRedirectUrlsForm(mockRequest, mockResponse, mockNext);

        expect(mockResponse.render).toHaveBeenCalledWith("clients/change-redirect-uris.njk", {
            serviceId: TEST_SERVICE_ID,
            selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
            clientId: TEST_CLIENT_ID,
            redirectUris: TEST_CLIENT.redirectUris,
            authClientId: TEST_CLIENT.authClientId,
            updateResult: null
        });
    });
});

describe("showAddRedirectUriForm controller tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("calls s4 list client and renders the add redirect uri template with the expected values", async () => {
        s4ListClientsSpy.mockResolvedValue([TEST_CLIENT]);

        const mockRequest = request({
            context: {
                serviceId: TEST_SERVICE_ID
            },
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            }
        });
        const mockResponse = response();

        await showAddRedirectUriForm(mockRequest, mockResponse, mockNext);

        expect(mockResponse.render).toHaveBeenCalledWith("clients/add-redirect-uri.njk", {
            serviceId: TEST_SERVICE_ID,
            selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
            clientId: TEST_CLIENT_ID,
            redirectUris: TEST_CLIENT.redirectUris,
            authClientId: TEST_CLIENT.authClientId
        });
    });
});

describe("processAddRedirectUriForm controller tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("redirects back to the /change-redirect-uris with an error message if the redirect uri is already added to the client", async () => {
        s4ListClientsSpy.mockResolvedValue([TEST_CLIENT]);

        const mockRequest = request({
            session: {
                id: TEST_SESSION_ID,
                authenticationResult: TEST_AUTHENTICATION_RESULT
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            body: {
                redirectUri: TEST_REDIRECT_URI
            },
            context: {
                serviceId: TEST_SERVICE_ID
            },
            ip: TEST_IP_ADDRESS
        });
        const mockResponse = response();

        await processAddRedirectUriForm(mockRequest, mockResponse, mockNext);

        expect(s4ListClientsSpy).toHaveBeenCalledWith(TEST_SERVICE_ID, TEST_AUTHENTICATION_RESULT.AccessToken);
        expect(mockResponse.redirect).toHaveBeenCalledWith(
            `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT_ID}/${TEST_SELF_SERVICE_CLIENT_ID}/change-redirect-uris?updateResult=${encodeURIComponent(
                "This URI has already been added"
            )}`
        );
    });

    it("updates the client with the new redirect URI, sends a txma log and redirects to /change-redirect-uris with a url encoded success message", async () => {
        const newRedirectUri = "aNewRedirectURI";
        s4ListClientsSpy.mockResolvedValue([TEST_CLIENT]);
        s4UpdateClientSpy.mockResolvedValue();
        s4SendTxmaLogSpy.mockReturnValue();

        const mockRequest = request({
            session: {
                id: TEST_SESSION_ID,
                authenticationResult: TEST_AUTHENTICATION_RESULT
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            body: {
                redirectUri: newRedirectUri
            },
            context: {
                serviceId: TEST_SERVICE_ID
            },
            ip: TEST_IP_ADDRESS
        });
        const mockResponse = response();

        await processAddRedirectUriForm(mockRequest, mockResponse, mockNext);

        expect(s4ListClientsSpy).toHaveBeenCalledWith(TEST_SERVICE_ID, TEST_AUTHENTICATION_RESULT.AccessToken);
        expect(s4UpdateClientSpy).toHaveBeenCalledWith(
            TEST_SERVICE_ID,
            TEST_SELF_SERVICE_CLIENT_ID,
            TEST_CLIENT_ID,
            {
                redirect_uris: [...TEST_CLIENT.redirectUris, newRedirectUri]
            },
            TEST_AUTHENTICATION_RESULT.AccessToken
        );
        expect(s4SendTxmaLogSpy).toHaveBeenCalledWith(
            "SSE_UPDATE_REDIRECT_URL",
            {
                session_id: TEST_SESSION_ID,
                ip_address: TEST_IP_ADDRESS,
                user_id: TEST_COGNITO_ID
            },
            {
                service_id: TEST_SERVICE_ID
            }
        );
        expect(mockResponse.redirect).toHaveBeenCalledWith(
            `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT_ID}/${TEST_SELF_SERVICE_CLIENT_ID}/change-redirect-uris?updateResult=${encodeURIComponent(
                "Redirect URIs updated"
            )}`
        );
    });
});

describe("showConfirmRedirectUriRemovalForm controller tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("calls s4 list client and renders the confirm-redirect-uri-removal template with the expected values", async () => {
        s4ListClientsSpy.mockResolvedValue([TEST_CLIENT]);

        const mockRequest = request({
            context: {
                serviceId: TEST_SERVICE_ID
            },
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            query: {
                uriToRemove: TEST_REDIRECT_URI
            }
        });
        const mockResponse = response();

        await showConfirmRedirectUriRemovalForm(mockRequest, mockResponse, mockNext);

        expect(mockResponse.render).toHaveBeenCalledWith("clients/confirm-redirect-uri-removal.njk", {
            serviceId: TEST_SERVICE_ID,
            selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
            clientId: TEST_CLIENT_ID,
            authClientId: TEST_CLIENT.authClientId,
            uriToRemove: TEST_REDIRECT_URI
        });
    });
});

describe("processRemoveRedirectUriFrom controller tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("redirects to /change-redirect-uris with a non update message if the redirect uri to remove is not in the client", async () => {
        s4ListClientsSpy.mockResolvedValue([TEST_CLIENT]);

        const mockRequest = request({
            session: {
                id: TEST_SESSION_ID,
                authenticationResult: TEST_AUTHENTICATION_RESULT
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            body: {
                removeUri: "yes",
                uriToRemove: "someUriNotInTheClient"
            },
            context: {
                serviceId: TEST_SERVICE_ID
            },
            ip: TEST_IP_ADDRESS
        });
        const mockResponse = response();

        await processRemoveRedirectUriFrom(mockRequest, mockResponse, mockNext);

        expect(s4ListClientsSpy).toHaveBeenCalledWith(TEST_SERVICE_ID, TEST_AUTHENTICATION_RESULT.AccessToken);
        expect(mockResponse.redirect).toHaveBeenCalledWith(
            `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT_ID}/${TEST_SELF_SERVICE_CLIENT_ID}/change-redirect-uris?updateResult=${encodeURIComponent(
                "Not updated. URI not found"
            )}`
        );
        expect(s4UpdateClientSpy).not.toHaveBeenCalled();
    });

    it("redirects to /change-redirect-uris with a non update message if there is only 1 redirect uri for the client", async () => {
        async () => {
            s4ListClientsSpy.mockResolvedValue([TEST_CLIENT]);

            const mockRequest = request({
                session: {
                    id: TEST_SESSION_ID,
                    authenticationResult: TEST_AUTHENTICATION_RESULT
                },
                params: {
                    selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                    clientId: TEST_CLIENT_ID
                },
                body: {
                    removeUri: "yes",
                    uriToRemove: TEST_CLIENT.redirectUris[0]
                },
                context: {
                    serviceId: TEST_SERVICE_ID
                },
                ip: TEST_IP_ADDRESS
            });
            const mockResponse = response();

            await processRemoveRedirectUriFrom(mockRequest, mockResponse, mockNext);

            expect(s4ListClientsSpy).toHaveBeenCalledWith(TEST_SERVICE_ID, TEST_AUTHENTICATION_RESULT.AccessToken);
            expect(mockResponse.redirect).toHaveBeenCalledWith(
                `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT_ID}/${TEST_SELF_SERVICE_CLIENT_ID}/change-redirect-uris?updateResult=${encodeURIComponent(
                    "Not updated. At least one redirect URI is required"
                )}`
            );
            expect(s4UpdateClientSpy).not.toHaveBeenCalled();
        };
    });

    it("calls update client with the updated redirect uris, sends a txma log and redirects back to  /change-redirect-uris with a success message url encoded", async () => {
        const uriToRemove = "someUri";

        s4ListClientsSpy.mockResolvedValue([{...TEST_CLIENT, redirectUris: [...TEST_CLIENT.redirectUris, uriToRemove]}]);
        s4UpdateClientSpy.mockResolvedValue();
        s4SendTxmaLogSpy.mockReturnValue();

        const mockRequest = request({
            session: {
                id: TEST_SESSION_ID,
                authenticationResult: TEST_AUTHENTICATION_RESULT
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            body: {
                removeUri: "yes",
                uriToRemove: uriToRemove
            },
            context: {
                serviceId: TEST_SERVICE_ID
            },
            ip: TEST_IP_ADDRESS
        });
        const mockResponse = response();

        await processRemoveRedirectUriFrom(mockRequest, mockResponse, mockNext);

        expect(s4ListClientsSpy).toHaveBeenCalledWith(TEST_SERVICE_ID, TEST_AUTHENTICATION_RESULT.AccessToken);
        expect(s4UpdateClientSpy).toHaveBeenCalledWith(
            TEST_SERVICE_ID,
            TEST_SELF_SERVICE_CLIENT_ID,
            TEST_CLIENT_ID,
            {
                redirect_uris: [TEST_CLIENT.redirectUris[0]]
            },
            TEST_AUTHENTICATION_RESULT.AccessToken
        );
        expect(s4SendTxmaLogSpy).toHaveBeenCalledWith(
            "SSE_UPDATE_REDIRECT_URL",
            {
                session_id: TEST_SESSION_ID,
                ip_address: TEST_IP_ADDRESS,
                user_id: TEST_COGNITO_ID
            },
            {
                service_id: TEST_SERVICE_ID
            }
        );
        expect(mockResponse.redirect).toHaveBeenCalledWith(
            `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT_ID}/${TEST_SELF_SERVICE_CLIENT_ID}/change-redirect-uris?updateResult=${encodeURIComponent(
                "Redirect URIs updated"
            )}`
        );
    });

    it("redirects to /change-redirect-uris without updating the client if the user selected 'no'", async () => {
        s4ListClientsSpy.mockResolvedValue([TEST_CLIENT]);

        const mockRequest = request({
            session: {
                id: TEST_SESSION_ID,
                authenticationResult: TEST_AUTHENTICATION_RESULT
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            body: {
                removeUri: "no",
                uriToRemove: "someUri"
            },
            context: {
                serviceId: TEST_SERVICE_ID
            },
            ip: TEST_IP_ADDRESS
        });
        const mockResponse = response();

        await processRemoveRedirectUriFrom(mockRequest, mockResponse, mockNext);

        expect(s4ListClientsSpy).toHaveBeenCalledWith(TEST_SERVICE_ID, TEST_AUTHENTICATION_RESULT.AccessToken);
        expect(mockResponse.redirect).toHaveBeenCalledWith(
            `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT_ID}/${TEST_SELF_SERVICE_CLIENT_ID}/change-redirect-uris`
        );
        expect(s4UpdateClientSpy).not.toHaveBeenCalled();
    });

    it("renders the confirm-redirect-uri-removal template with an error message if the removeUri is not 'yes' or 'no' ", async () => {
        s4ListClientsSpy.mockResolvedValue([TEST_CLIENT]);

        const mockRequest = request({
            session: {
                id: TEST_SESSION_ID,
                authenticationResult: TEST_AUTHENTICATION_RESULT
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            body: {
                removeUri: "someInvalidOption",
                uriToRemove: "someUri"
            },
            context: {
                serviceId: TEST_SERVICE_ID
            },
            ip: TEST_IP_ADDRESS,
            query: {
                uriToRemove: "someUri"
            }
        });
        const mockResponse = response();

        await processRemoveRedirectUriFrom(mockRequest, mockResponse, mockNext);

        expect(s4ListClientsSpy).toHaveBeenCalledWith(TEST_SERVICE_ID, TEST_AUTHENTICATION_RESULT.AccessToken);
        expect(s4UpdateClientSpy).not.toHaveBeenCalled();
        expect(mockResponse.render).toHaveBeenCalledWith("clients/confirm-redirect-uri-removal.njk", {
            serviceId: TEST_SERVICE_ID,
            authClientId: TEST_CLIENT_ID,
            selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
            uriToRemove: "someUri",
            errorMessages: {
                "removeUri-options": "Select yes if you want to remove this redirect URI"
            }
        });
    });
});

describe("showChangeUserAttributesForm controller tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders the change-user-attributes template with the expected values", () => {
        const mockRequest = request({
            context: {
                serviceId: TEST_SERVICE_ID
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            query: {
                userAttributes: TEST_USER_ATTRIBUTES
            }
        });
        const mockResponse = response();

        showChangeUserAttributesForm(mockRequest, mockResponse, mockNext);

        expect(mockResponse.render).toHaveBeenCalledWith("clients/change-user-attributes.njk", {
            selectedUserAttributes: TEST_USER_ATTRIBUTES.toString().split(" "),
            serviceId: TEST_SERVICE_ID,
            selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
            clientId: TEST_CLIENT_ID
        });
    });
});

describe("processChangeUserAttributesForm controller tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("calls s4 update client, adding a single user attribute if the body field is a string and redirects to /services/:serviceId/clients", async () => {
        s4UpdateClientSpy.mockResolvedValue();

        const mockRequest = request({
            context: {
                serviceId: TEST_SERVICE_ID
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            body: {
                userAttributes: TEST_USER_ATTRIBUTES[0]
            },
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT
            }
        });
        const mockResponse = response();

        await processChangeUserAttributesForm(mockRequest, mockResponse, mockNext);

        expect(s4UpdateClientSpy).toHaveBeenCalledWith(
            TEST_SERVICE_ID,
            TEST_SELF_SERVICE_CLIENT_ID,
            TEST_CLIENT_ID,
            {
                scopes: ["openid", TEST_USER_ATTRIBUTES[0]]
            },
            TEST_AUTHENTICATION_RESULT.AccessToken
        );
        expect(mockRequest.session.updatedField).toBe("required user attributes");
        expect(mockResponse.redirect).toHaveBeenCalledWith(`/services/${TEST_SERVICE_ID}/clients`);
    });

    it("calls s4 update client, adding a multiple user attribute if the body field is an array and redirects to /services/:serviceId/clients", async () => {
        s4UpdateClientSpy.mockResolvedValue();

        const mockRequest = request({
            context: {
                serviceId: TEST_SERVICE_ID
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            body: {
                userAttributes: TEST_USER_ATTRIBUTES
            },
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT
            }
        });
        const mockResponse = response();

        await processChangeUserAttributesForm(mockRequest, mockResponse, mockNext);

        expect(s4UpdateClientSpy).toHaveBeenCalledWith(
            TEST_SERVICE_ID,
            TEST_SELF_SERVICE_CLIENT_ID,
            TEST_CLIENT_ID,
            {
                scopes: ["openid", ...TEST_USER_ATTRIBUTES]
            },
            TEST_AUTHENTICATION_RESULT.AccessToken
        );
        expect(mockRequest.session.updatedField).toBe("required user attributes");
        expect(mockResponse.redirect).toHaveBeenCalledWith(`/services/${TEST_SERVICE_ID}/clients`);
    });
});

describe("showChangePostLogoutUrisForm controller tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("calls s4 list client to retrieve the client details and renders the change-post-logout-uris template with the expected values", async () => {
        s4ListClientsSpy.mockResolvedValue([TEST_CLIENT]);

        const mockRequest = request({
            context: {
                serviceId: TEST_SERVICE_ID
            },
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            query: {
                updateResult: null
            }
        });
        const mockResponse = response();

        await showChangePostLogoutUrisForm(mockRequest, mockResponse, mockNext);

        expect(mockResponse.render).toHaveBeenCalledWith("clients/change-post-logout-uris.njk", {
            serviceId: TEST_SERVICE_ID,
            selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
            clientId: TEST_CLIENT_ID,
            authClientId: TEST_CLIENT.authClientId,
            postLogoutRedirectUris: TEST_CLIENT.postLogoutUris,
            updateResult: null
        });
    });
});

describe("showAddPostLogoutUriForm controller tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("calls s4 list client to retrieve the client details and renders the add-post-logout-uri template with the expected values", async () => {
        s4ListClientsSpy.mockResolvedValue([TEST_CLIENT]);

        const mockRequest = request({
            context: {
                serviceId: TEST_SERVICE_ID
            },
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            }
        });
        const mockResponse = response();

        await showAddPostLogoutUriForm(mockRequest, mockResponse, mockNext);

        expect(mockResponse.render).toHaveBeenCalledWith("clients/add-post-logout-uri.njk", {
            serviceId: TEST_SERVICE_ID,
            selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
            clientId: TEST_CLIENT_ID,
            authClientId: TEST_CLIENT.authClientId,
            postLogoutRedirectUris: TEST_CLIENT.postLogoutUris
        });
    });
});

describe("processAddPostLogoutUriForm controller tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("redirects back to /change-post-logout-uris with a 'URI already exists' message if the client already has the URI", async () => {
        s4ListClientsSpy.mockResolvedValue([TEST_CLIENT]);

        const mockRequest = request({
            session: {
                id: TEST_SESSION_ID,
                authenticationResult: TEST_AUTHENTICATION_RESULT
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            body: {
                postLogoutRedirectUri: TEST_POST_LOGOUT_REDIRECT_URI
            },
            context: {
                serviceId: TEST_SERVICE_ID
            },
            ip: TEST_IP_ADDRESS
        });
        const mockResponse = response();

        await processAddPostLogoutUriForm(mockRequest, mockResponse, mockNext);

        expect(s4ListClientsSpy).toHaveBeenCalledWith(TEST_SERVICE_ID, TEST_AUTHENTICATION_RESULT.AccessToken);
        expect(mockResponse.redirect).toHaveBeenCalledWith(
            `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT_ID}/${TEST_SELF_SERVICE_CLIENT_ID}/change-post-logout-uris?updateResult=${encodeURIComponent(
                "Not updated. URI already exists"
            )}`
        );
    });

    it("updates the client with the new post logout uris, sends a txma log and then redirects with a success message to /change-post-logout-uris", async () => {
        const newPostLogoutRedirectUri = "aNewRedirectURI";

        s4ListClientsSpy.mockResolvedValue([TEST_CLIENT]);
        s4UpdateClientSpy.mockResolvedValue();
        s4SendTxmaLogSpy.mockReturnValue();

        const mockRequest = request({
            session: {
                id: TEST_SESSION_ID,
                authenticationResult: TEST_AUTHENTICATION_RESULT
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            body: {
                postLogoutRedirectUri: newPostLogoutRedirectUri
            },
            context: {
                serviceId: TEST_SERVICE_ID
            },
            ip: TEST_IP_ADDRESS
        });
        const mockResponse = response();

        await processAddPostLogoutUriForm(mockRequest, mockResponse, mockNext);

        expect(s4ListClientsSpy).toHaveBeenCalledWith(TEST_SERVICE_ID, TEST_AUTHENTICATION_RESULT.AccessToken);
        expect(s4UpdateClientSpy).toHaveBeenCalledWith(
            TEST_SERVICE_ID,
            TEST_SELF_SERVICE_CLIENT_ID,
            TEST_CLIENT_ID,
            {
                post_logout_redirect_uris: [...TEST_CLIENT.postLogoutUris, newPostLogoutRedirectUri]
            },
            TEST_AUTHENTICATION_RESULT.AccessToken
        );
        expect(s4SendTxmaLogSpy).toHaveBeenCalledWith(
            "SSE_UPDATE_LOGOUT_REDIRECT_URL",
            {
                session_id: TEST_SESSION_ID,
                ip_address: TEST_IP_ADDRESS,
                user_id: TEST_COGNITO_ID
            },
            {
                service_id: TEST_SERVICE_ID
            }
        );
        expect(mockResponse.redirect).toHaveBeenCalledWith(
            `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT_ID}/${TEST_SELF_SERVICE_CLIENT_ID}/change-post-logout-uris?updateResult=${encodeURIComponent(
                "Post logout redirect URIs updated"
            )}`
        );
    });
});

describe("showConfirmPostLogoutUriRemovalForm controller tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("calls s4 list client and renders the confirm-post-logout-uri-removal template with the expected values", async () => {
        s4ListClientsSpy.mockResolvedValue([TEST_CLIENT]);

        const mockRequest = request({
            context: {
                serviceId: TEST_SERVICE_ID
            },
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            query: {
                uriToRemove: TEST_POST_LOGOUT_REDIRECT_URI
            }
        });
        const mockResponse = response();

        await showConfirmPostLogoutUriRemovalForm(mockRequest, mockResponse, mockNext);

        expect(mockResponse.render).toHaveBeenCalledWith("clients/confirm-post-logout-uri-removal.njk", {
            serviceId: TEST_SERVICE_ID,
            selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
            clientId: TEST_CLIENT_ID,
            authClientId: TEST_CLIENT.authClientId,
            uriToRemove: TEST_POST_LOGOUT_REDIRECT_URI
        });
    });
});

describe("processRemovePostLogoutUriFrom controller tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("does not update the client if the post logout redirect uri is not in the client config and redirects back to /change-post-logout-uris with an update message", async () => {
        s4ListClientsSpy.mockResolvedValue([TEST_CLIENT]);

        const mockRequest = request({
            session: {
                id: TEST_SESSION_ID,
                authenticationResult: TEST_AUTHENTICATION_RESULT
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            body: {
                removeUri: "yes",
                uriToRemove: "someUriNotInTheClient"
            },
            context: {
                serviceId: TEST_SERVICE_ID
            },
            ip: TEST_IP_ADDRESS
        });
        const mockResponse = response();

        await processRemovePostLogoutUriFrom(mockRequest, mockResponse, mockNext);

        expect(s4ListClientsSpy).toHaveBeenCalledWith(TEST_SERVICE_ID, TEST_AUTHENTICATION_RESULT.AccessToken);
        expect(mockResponse.redirect).toHaveBeenCalledWith(
            `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT_ID}/${TEST_SELF_SERVICE_CLIENT_ID}/change-post-logout-uris?updateResult=${encodeURIComponent(
                "Not updated. URI not found"
            )}`
        );
        expect(s4UpdateClientSpy).not.toHaveBeenCalled();
    });

    it("updates the client's post logout redirect uris, sends a txma log, and redirects to /services/:serviceId/clients when there are no post logout redirect uris left in the client config", async () => {
        s4ListClientsSpy.mockResolvedValue([TEST_CLIENT]);
        s4UpdateClientSpy.mockResolvedValue();
        s4SendTxmaLogSpy.mockReturnValue();

        const mockRequest = request({
            session: {
                id: TEST_SESSION_ID,
                authenticationResult: TEST_AUTHENTICATION_RESULT
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            body: {
                removeUri: "yes",
                uriToRemove: TEST_CLIENT.postLogoutUris[0]
            },
            context: {
                serviceId: TEST_SERVICE_ID
            },
            ip: TEST_IP_ADDRESS
        });
        const mockResponse = response();

        await processRemovePostLogoutUriFrom(mockRequest, mockResponse, mockNext);

        expect(s4ListClientsSpy).toHaveBeenCalledWith(TEST_SERVICE_ID, TEST_AUTHENTICATION_RESULT.AccessToken);
        expect(s4UpdateClientSpy).toHaveBeenCalledWith(
            TEST_SERVICE_ID,
            TEST_SELF_SERVICE_CLIENT_ID,
            TEST_CLIENT_ID,
            {post_logout_redirect_uris: []},
            TEST_AUTHENTICATION_RESULT.AccessToken
        );
        expect(s4SendTxmaLogSpy).toHaveBeenCalledWith(
            "SSE_UPDATE_LOGOUT_REDIRECT_URL",
            {
                session_id: TEST_SESSION_ID,
                ip_address: TEST_IP_ADDRESS,
                user_id: TEST_COGNITO_ID
            },
            {
                service_id: TEST_SERVICE_ID
            }
        );
        expect(mockResponse.redirect).toHaveBeenCalledWith(`/services/${TEST_SERVICE_ID}/clients`);
    });

    it("updates the client's post logout redirect uris, sends a txma log, and redirects to /change-post-logout-uris with an update message when there are still post logout redirect uris in the user config", async () => {
        const postLogoutUriToRemove = "someUri";
        s4ListClientsSpy.mockResolvedValue([{...TEST_CLIENT, postLogoutUris: [TEST_CLIENT.postLogoutUris[0], postLogoutUriToRemove]}]);
        s4UpdateClientSpy.mockResolvedValue();
        s4SendTxmaLogSpy.mockReturnValue();

        const mockRequest = request({
            session: {
                id: TEST_SESSION_ID,
                authenticationResult: TEST_AUTHENTICATION_RESULT
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            body: {
                removeUri: "yes",
                uriToRemove: postLogoutUriToRemove
            },
            context: {
                serviceId: TEST_SERVICE_ID
            },
            ip: TEST_IP_ADDRESS
        });
        const mockResponse = response();

        await processRemovePostLogoutUriFrom(mockRequest, mockResponse, mockNext);

        expect(s4ListClientsSpy).toHaveBeenCalledWith(TEST_SERVICE_ID, TEST_AUTHENTICATION_RESULT.AccessToken);
        expect(s4UpdateClientSpy).toHaveBeenCalledWith(
            TEST_SERVICE_ID,
            TEST_SELF_SERVICE_CLIENT_ID,
            TEST_CLIENT_ID,
            {post_logout_redirect_uris: [TEST_CLIENT.postLogoutUris[0]]},
            TEST_AUTHENTICATION_RESULT.AccessToken
        );
        expect(s4SendTxmaLogSpy).toHaveBeenCalledWith(
            "SSE_UPDATE_LOGOUT_REDIRECT_URL",
            {
                session_id: TEST_SESSION_ID,
                ip_address: TEST_IP_ADDRESS,
                user_id: TEST_COGNITO_ID
            },
            {
                service_id: TEST_SERVICE_ID
            }
        );
        expect(mockResponse.redirect).toHaveBeenCalledWith(
            `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT_ID}/${TEST_SELF_SERVICE_CLIENT_ID}/change-post-logout-uris?updateResult=${encodeURIComponent(
                "Post logout redirect URIs updated"
            )}`
        );
    });

    it("redirects back to /change-post-logout-uris without an update message if the user selects no", async () => {
        s4ListClientsSpy.mockResolvedValue([TEST_CLIENT]);

        const mockRequest = request({
            session: {
                id: TEST_SESSION_ID,
                authenticationResult: TEST_AUTHENTICATION_RESULT
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            body: {
                removeUri: "no",
                uriToRemove: "someUri"
            },
            context: {
                serviceId: TEST_SERVICE_ID
            },
            ip: TEST_IP_ADDRESS
        });
        const mockResponse = response();

        await processRemovePostLogoutUriFrom(mockRequest, mockResponse, mockNext);

        expect(s4ListClientsSpy).toHaveBeenCalledWith(TEST_SERVICE_ID, TEST_AUTHENTICATION_RESULT.AccessToken);
        expect(mockResponse.redirect).toHaveBeenCalledWith(
            `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT_ID}/${TEST_SELF_SERVICE_CLIENT_ID}/change-post-logout-uris`
        );
        expect(s4UpdateClientSpy).not.toHaveBeenCalled();
    });

    it("renders the confirm-post-logout-uri-removal template with an error message if the removeUri is neither 'yes' nor 'no' ", async () => {
        s4ListClientsSpy.mockResolvedValue([TEST_CLIENT]);

        const mockRequest = request({
            session: {
                id: TEST_SESSION_ID,
                authenticationResult: TEST_AUTHENTICATION_RESULT
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            body: {
                removeUri: "someInvalidOption",
                uriToRemove: "someUri"
            },
            context: {
                serviceId: TEST_SERVICE_ID
            },
            query: {
                uriToRemove: "someUri"
            }
        });
        const mockResponse = response();

        await processRemovePostLogoutUriFrom(mockRequest, mockResponse, mockNext);

        expect(s4ListClientsSpy).toHaveBeenCalledWith(TEST_SERVICE_ID, TEST_AUTHENTICATION_RESULT.AccessToken);
        expect(mockResponse.render).toHaveBeenCalledWith("clients/confirm-post-logout-uri-removal.njk", {
            serviceId: TEST_SERVICE_ID,
            authClientId: TEST_CLIENT_ID,
            selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
            uriToRemove: "someUri",
            errorMessages: {
                "removeUri-options": "Select yes if you want to remove this post logout redirect URI"
            }
        });
        expect(s4UpdateClientSpy).not.toHaveBeenCalled();
    });
});

describe("showChangeBackChannelLogoutUriForm controller tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders the expected template with the expected values", () => {
        const mockRequest = request({
            context: {
                serviceId: TEST_SERVICE_ID
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            query: {
                backChannelLogoutUri: TEST_BACK_CHANNEL_LOGOUT_URI
            }
        });
        const mockResponse = response();

        showChangeBackChannelLogoutUriForm(mockRequest, mockResponse, mockNext);

        expect(mockResponse.render).toHaveBeenCalledWith("clients/change-back-channel-logout-uri.njk", {
            serviceId: TEST_SERVICE_ID,
            selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
            clientId: TEST_CLIENT_ID,
            values: {
                backChannelLogoutUri: TEST_BACK_CHANNEL_LOGOUT_URI
            }
        });
    });
});

describe("processChangeBackChannelLogOutUriForm controller tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("calls s4 update client with the new backchannel logout uri and then redirects to`/services/:serviceId/clients", async () => {
        s4UpdateClientSpy.mockResolvedValue();

        const mockRequest = request({
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            body: {
                backChannelLogoutUri: TEST_BACK_CHANNEL_LOGOUT_URI
            },
            context: {
                serviceId: TEST_SERVICE_ID
            }
        });
        const mockResponse = response();

        await processChangeBackChannelLogOutUriForm(mockRequest, mockResponse, mockNext);

        expect(s4UpdateClientSpy).toHaveBeenCalledWith(
            TEST_SERVICE_ID,
            TEST_SELF_SERVICE_CLIENT_ID,
            TEST_CLIENT_ID,
            {back_channel_logout_uri: [TEST_BACK_CHANNEL_LOGOUT_URI]},
            TEST_AUTHENTICATION_RESULT.AccessToken
        );
        expect(mockRequest.session.updatedField).toBe("Back channel logout URI");
        expect(mockResponse.redirect).toHaveBeenCalledWith(`/services/${TEST_SERVICE_ID}/clients`);
    });
});

describe("showChangeSectorIdentifierUriForm controller tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders the expected template with the expected values", () => {
        const mockRequest = request({
            context: {
                serviceId: TEST_SERVICE_ID
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            query: {
                sectorIdentifierUri: TEST_SECTOR_IDENTIFIER_URI
            }
        });
        const mockResponse = response();

        showChangeSectorIdentifierUriForm(mockRequest, mockResponse, mockNext);

        expect(mockResponse.render).toHaveBeenCalledWith("clients/change-sector-identifier-uri.njk", {
            serviceId: TEST_SERVICE_ID,
            selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
            clientId: TEST_CLIENT_ID,
            values: {
                sectorIdentifierUri: TEST_SECTOR_IDENTIFIER_URI
            }
        });
    });
});

describe("processChangeSectorIdentifierUriForm controller tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("calls s4 update client with the new sectorIdentifierUri  and then redirects to`/services/:serviceId/clients", async () => {
        s4UpdateClientSpy.mockResolvedValue();

        const mockRequest = request({
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            body: {
                sectorIdentifierUri: TEST_SECTOR_IDENTIFIER_URI
            },
            context: {
                serviceId: TEST_SERVICE_ID
            }
        });
        const mockResponse = response();

        await processChangeSectorIdentifierUriForm(mockRequest, mockResponse, mockNext);

        expect(s4UpdateClientSpy).toHaveBeenCalledWith(
            TEST_SERVICE_ID,
            TEST_SELF_SERVICE_CLIENT_ID,
            TEST_CLIENT_ID,
            {sector_identifier_uri: TEST_SECTOR_IDENTIFIER_URI},
            TEST_AUTHENTICATION_RESULT.AccessToken
        );
        expect(mockRequest.session.updatedField).toBe("Sector Identifier URI");
        expect(mockResponse.redirect).toHaveBeenCalledWith(`/services/${TEST_SERVICE_ID}/clients`);
    });
});

describe("showEnterContactForm controller tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("calls s4 list client and renders the confirm-post-logout-uri-removal template with the expected values", async () => {
        s4ListClientsSpy.mockResolvedValue([TEST_CLIENT]);

        const mockRequest = request({
            context: {
                serviceId: TEST_SERVICE_ID
            },
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID
            },
            query: {
                updateResult: null
            }
        });
        const mockResponse = response();

        await showEnterContactForm(mockRequest, mockResponse, mockNext);

        expect(mockResponse.render).toHaveBeenCalledWith("clients/enter-contact.njk", {
            serviceId: TEST_SERVICE_ID,
            selfServiceClientId: TEST_CLIENT.dynamoServiceId,
            authClientId: TEST_CLIENT.authClientId,
            updateResult: null,
            contacts: TEST_CLIENT.contacts
        });
    });
});

describe("showConfirmContactRemovalForm controller tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders the confirm-contact-removal template with the expected values", () => {
        const mockRequest = request({
            context: {
                serviceId: TEST_SERVICE_ID
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            query: {
                contactToRemove: TEST_EMAIL
            }
        });
        const mockResponse = response();

        showConfirmContactRemovalForm(mockRequest, mockResponse, mockNext);

        expect(mockResponse.render).toHaveBeenCalledWith("clients/confirm-contact-removal.njk", {
            serviceId: TEST_SERVICE_ID,
            selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
            authClientId: TEST_CLIENT_ID,
            contactToRemove: TEST_EMAIL
        });
    });
});

describe("processConfirmContactRemovalForm controller tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("removes the contact if the user has selected yes and it is not the initial contact, and redirects to enter-contact", async () => {
        const contactToRemove = "some.contact@example.gov.uk";

        s4ListClientsSpy.mockResolvedValue([{...TEST_CLIENT, contacts: [...TEST_CLIENT.contacts, contactToRemove]}]);
        s4UpdateClientSpy.mockResolvedValue();

        const mockRequest = request({
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            body: {
                contactToRemove: contactToRemove,
                removeContact: "yes"
            },
            context: {
                serviceId: TEST_SERVICE_ID
            }
        });
        const mockResponse = response();

        await processConfirmContactRemovalForm(mockRequest, mockResponse, mockNext);

        expect(s4ListClientsSpy).toHaveBeenCalledWith(TEST_SERVICE_ID, TEST_AUTHENTICATION_RESULT.AccessToken);
        expect(s4UpdateClientSpy).toHaveBeenCalledWith(
            TEST_SERVICE_ID,
            TEST_SELF_SERVICE_CLIENT_ID,
            TEST_CLIENT_ID,
            {contacts: [...TEST_CLIENT.contacts]},
            TEST_AUTHENTICATION_RESULT.AccessToken
        );
        expect(mockResponse.redirect).toHaveBeenCalledWith(
            `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT_ID}/${TEST_SELF_SERVICE_CLIENT_ID}/enter-contact?updateResult=${encodeURIComponent(
                "Contacts updated"
            )}`
        );
    });

    it("redirects to enter-contact with an update message when the contact is not present in the contact list", async () => {
        s4ListClientsSpy.mockResolvedValue([TEST_CLIENT]);
        s4UpdateClientSpy.mockResolvedValue();

        const mockRequest = request({
            session: {
                id: TEST_SESSION_ID,
                authenticationResult: TEST_AUTHENTICATION_RESULT
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            body: {
                contactToRemove: "someContactNotInClientConfig",
                removeContact: "yes"
            },
            context: {
                serviceId: TEST_SERVICE_ID
            }
        });
        const mockResponse = response();

        await processConfirmContactRemovalForm(mockRequest, mockResponse, mockNext);

        expect(s4ListClientsSpy).toHaveBeenCalledWith(TEST_SERVICE_ID, TEST_AUTHENTICATION_RESULT.AccessToken);
        expect(s4UpdateClientSpy).not.toHaveBeenCalled();
        expect(mockResponse.redirect).toHaveBeenCalledWith(
            `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT_ID}/${TEST_SELF_SERVICE_CLIENT_ID}/enter-contact?updateResult=${encodeURIComponent(
                "Not updated. Contact not found"
            )}`
        );
    });

    it("redirects to enter-contact no update message when the user selects no", async () => {
        s4ListClientsSpy.mockResolvedValue([TEST_CLIENT]);
        s4UpdateClientSpy.mockResolvedValue();

        const mockRequest = request({
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            body: {
                contactToRemove: "someContact",
                removeContact: "no"
            },
            context: {
                serviceId: TEST_SERVICE_ID
            }
        });
        const mockResponse = response();

        await processConfirmContactRemovalForm(mockRequest, mockResponse, mockNext);

        expect(s4ListClientsSpy).toHaveBeenCalledWith(TEST_SERVICE_ID, TEST_AUTHENTICATION_RESULT.AccessToken);
        expect(s4UpdateClientSpy).not.toHaveBeenCalled();
        expect(mockResponse.redirect).toHaveBeenCalledWith(
            `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT_ID}/${TEST_SELF_SERVICE_CLIENT_ID}/enter-contact`
        );
    });
    it("renders the confirm-contact-removal template when the removeContact field is neither 'yes' nor 'no' ", async () => {
        s4ListClientsSpy.mockResolvedValue([TEST_CLIENT]);
        s4UpdateClientSpy.mockResolvedValue();

        const mockRequest = request({
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            body: {
                contactToRemove: "someContact",
                removeContact: "someInvalidValue"
            },
            context: {
                serviceId: TEST_SERVICE_ID
            },
            query: {
                contactToRemove: "someContact"
            }
        });
        const mockResponse = response();

        await processConfirmContactRemovalForm(mockRequest, mockResponse, mockNext);

        expect(s4ListClientsSpy).toHaveBeenCalledWith(TEST_SERVICE_ID, TEST_AUTHENTICATION_RESULT.AccessToken);
        expect(s4UpdateClientSpy).not.toHaveBeenCalled();
        expect(mockResponse.render).toHaveBeenCalledWith("clients/confirm-contact-removal.njk", {
            serviceId: TEST_SERVICE_ID,
            authClientId: TEST_CLIENT_ID,
            selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
            contactToRemove: "someContact",
            errorMessages: {
                "removeContact-options": "Select yes if you want to remove this contact"
            }
        });
    });
});

describe("showEnterContactEmailForm controller tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders the expected template with the expected values", () => {
        const mockRequest = request({
            context: {
                serviceId: TEST_SERVICE_ID
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            }
        });
        const mockResponse = response();

        showEnterContactEmailForm(mockRequest, mockResponse, mockNext);

        expect(mockResponse.render).toHaveBeenCalledWith("clients/enter-contact-email.njk", {
            serviceId: TEST_SERVICE_ID,
            selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
            authClientId: TEST_CLIENT_ID
        });
    });
});

describe("processEnterContactEmailForm controller tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders the enter-contact-email template with an error message when the contact is already added", async () => {
        const emailToAdd = "test@test.gov.uk";
        s4ListClientsSpy.mockResolvedValue([{...TEST_CLIENT, contacts: [emailToAdd]}]);

        const mockRequest = request({
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            body: {
                emailAddress: emailToAdd
            },
            context: {
                serviceId: TEST_SERVICE_ID
            }
        });
        const mockResponse = response();

        await processEnterContactEmailForm(mockRequest, mockResponse, mockNext);

        expect(s4UpdateClientSpy).not.toHaveBeenCalled();
        expect(mockResponse.render).toHaveBeenCalledWith("clients/enter-contact-email.njk", {
            values: {
                emailAddress: emailToAdd
            },
            errorMessages: {
                emailAddress: "This contact has already been added"
            },
            serviceId: TEST_SERVICE_ID,
            authClientId: TEST_CLIENT_ID,
            selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID
        });
    });

    it("updates the client contacts when the contact is not already added and then redirects back to /enter-contact with a success message", async () => {
        const emailToAdd = "test@test.gov.uk";
        s4ListClientsSpy.mockResolvedValue([TEST_CLIENT]);
        s4UpdateClientSpy.mockResolvedValue();

        const mockRequest = request({
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            body: {
                emailAddress: emailToAdd
            },
            context: {
                serviceId: TEST_SERVICE_ID
            }
        });
        const mockResponse = response();

        await processEnterContactEmailForm(mockRequest, mockResponse, mockNext);

        expect(s4UpdateClientSpy).toHaveBeenCalledWith(
            TEST_SERVICE_ID,
            TEST_SELF_SERVICE_CLIENT_ID,
            TEST_CLIENT_ID,
            {contacts: [TEST_EMAIL, emailToAdd]},
            TEST_AUTHENTICATION_RESULT.AccessToken
        );
        expect(mockResponse.redirect).toHaveBeenCalledWith(
            `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT_ID}/${TEST_SELF_SERVICE_CLIENT_ID}/enter-contact?updateResult=${encodeURIComponent(
                "Contacts updated"
            )}`
        );
    });

    it("renders the enter-contact-email template with an error message when the contact email is not valid", async () => {
        const emailToAdd = "someInvalidEmail@email.com";
        s4ListClientsSpy.mockResolvedValue([TEST_CLIENT]);

        const mockRequest = request({
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            body: {
                emailAddress: emailToAdd
            },
            context: {
                serviceId: TEST_SERVICE_ID
            }
        });
        const mockResponse = response();

        await processEnterContactEmailForm(mockRequest, mockResponse, mockNext);

        expect(s4UpdateClientSpy).not.toHaveBeenCalled();
        expect(mockResponse.render).toHaveBeenCalledWith("clients/enter-contact-email.njk", {
            values: {
                emailAddress: emailToAdd
            },
            errorMessages: {
                emailAddress: "Enter a government email address"
            },
            serviceId: TEST_SERVICE_ID,
            authClientId: TEST_CLIENT_ID,
            selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID
        });
    });
});
