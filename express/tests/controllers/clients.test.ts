const timestampMock = jest.fn();
jest.mock("../../src/lib/timestamp", () => timestampMock);

import SelfServiceServicesService from "../../src/services/self-service-services-service";
import {
    processAddPostLogoutUriForm,
    processAddRedirectUriForm,
    processChangeBackChannelLogOutUriForm,
    processChangeSectorIdentifierUriForm,
    processChangeServiceNameForm,
    processConfirmContactRemovalForm,
    processEnterClientSecretHashForm,
    processEnterContactEmailForm,
    processEnterIdentityVerificationForm,
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
    showClient,
    showConfirmContactRemovalForm,
    showConfirmPostLogoutUriRemovalForm,
    showConfirmRedirectUriRemovalForm,
    showEnterClientSecretHashForm,
    showEnterContactEmailForm,
    showEnterContactForm,
    showEnterIdentityVerificationForm,
    showGoLivePage,
    showChangeClientName,
    processChangeClientName,
    showMaxAgeEnabledForm,
    processMaxAgeEnabledForm,
    showChangePKCEEnforcedForm,
    processChangePKCEEnforcedForm,
    showChangeLandingPageUrlForm,
    processChangeLandingPageUrlForm
} from "../../src/controllers/clients";
import {
    TEST_ACCESS_TOKEN,
    TEST_AUTHENTICATION_RESULT,
    TEST_BACK_CHANNEL_LOGOUT_URI,
    TEST_BASIC_AUTH_PASSWORD,
    TEST_BASIC_AUTH_USERNAME,
    TEST_BOOLEAN_SUPPORTED,
    TEST_BOOLEAN_SUPPORTED_ALT,
    TEST_BOOLEAN_SUPPORTED_ALT_TX,
    TEST_BOOLEAN_SUPPORTED_TX,
    TEST_CLAIM,
    TEST_CLAIMS,
    TEST_CLAIMS_OUT,
    TEST_CLAIMS_OUT2,
    TEST_CLIENT,
    TEST_CLIENT_ID,
    TEST_CLIENT_NAME,
    TEST_COGNITO_ID,
    TEST_EMAIL,
    TEST_ID_SIGNING_TOKEN_ALGORITHM,
    TEST_IP_ADDRESS,
    TEST_LANDING_PAGE_URL,
    TEST_LEVELS_OF_CONFIDENCE,
    TEST_LEVELS_OF_CONFIDENCE_ALT,
    TEST_POST_LOGOUT_REDIRECT_URI,
    TEST_REDIRECT_URI,
    TEST_SCOPES_IN,
    TEST_SCOPES_OUT,
    TEST_SCOPES_OUT2,
    TEST_SECRET_HASH,
    TEST_SECTOR_IDENTIFIER_URI,
    TEST_SELF_SERVICE_CLIENT_ID,
    TEST_SERVICE_ID,
    TEST_SERVICE_NAME,
    TEST_SESSION_ID,
    TEST_STATIC_KEY_UPDATE,
    TEST_TIMESTAMP,
    TEST_TIMESTAMP_STRING,
    TEST_TOKEN_AUTH_METHOD,
    TEST_TOKEN_AUTH_METHOD_ALT
} from "../constants";
import {request, response} from "../mocks";
import {
    processChangeScopesForm,
    processChangePublicKeyForm,
    showChangeScopesForm,
    showChangeClaimsForm,
    processChangeClaimsForm
} from "../../src/controllers/clients";
import AuthenticationResultParser from "../../src/lib/authentication-result-parser";
import console from "console";

const s4ListClientsSpy = jest.spyOn(SelfServiceServicesService.prototype, "listClients");
const s4SendTxmaLogSpy = jest.spyOn(SelfServiceServicesService.prototype, "sendTxMALog");
const s4UpdateServiceSpy = jest.spyOn(SelfServiceServicesService.prototype, "updateService");
const s4UpdateClientSpy = jest.spyOn(SelfServiceServicesService.prototype, "updateClient");
jest.spyOn(AuthenticationResultParser, "getCognitoId").mockReturnValue(TEST_COGNITO_ID);
timestampMock.mockReturnValue(TEST_TIMESTAMP_STRING);

const mockNext = jest.fn();

describe("showClient Controller tests", () => {
    const defaultPublicKey =
        "MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEAp2mLkQGo24Kz1rut0oZlviMkGomlQCH+iT1pFvegZFXq39NPjRWyatmXp/XIUPqCq9Kk8/+tq4Sgjw+EM5tATJ06j5r+35of58ATGVPniW//IhGizrv6/ebGcGEUJ0Y/ZmlCHYPV+lbewpttQ/IYKM1nr3k/Rl6qepbVYe+MpGubluQvdhgUYel9OzxiOvUk7XI0axPquiXzoEgmNNOai8+WhYTkBqE3/OucAv+XwXdnx4XHmKzMwTv93dYMpUmvTxWcSeEJ/4/SrbiK4PyHWVKU2BozfSUejVNhahAzZeyyDwhYJmhBaZi/3eOOlqGXj9UdkOXbl3vcwBH8wD30O9/4F5ERLKxzOaMnKZ+RpnygWF0qFhf+UeFMy+O06sdgiaFnXaSCsIy/SohspkKiLjNnhvrDNmPLMQbQKQlJdcp6zUzI7Gzys7luEmOxyMpA32lDBQcjL7KNwM15s4ytfrJ46XEPZUXESce2gj6NazcPPsrTa/Q2+oLS9GWupGh7AgMBAAE=";

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.BASIC_AUTH_USERNAME = TEST_BASIC_AUTH_USERNAME;
        process.env.BASIC_AUTH_PASSWORD = TEST_BASIC_AUTH_PASSWORD;
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
            authMethod: TEST_CLIENT.token_endpoint_auth_method,
            clientId: TEST_CLIENT.authClientId,
            selfServiceClientId: TEST_CLIENT.dynamoServiceId,
            serviceId: TEST_SERVICE_ID,
            serviceName: TEST_CLIENT.serviceName,
            token_endpoint_auth_method: TEST_TOKEN_AUTH_METHOD,
            successBannerMessage: undefined,
            redirectUris: TEST_CLIENT.redirectUris,
            scopesRequired: TEST_CLIENT.scopes,
            userPublicKey: TEST_CLIENT.publicKey,
            backChannelLogoutUri: TEST_CLIENT.back_channel_logout_uri,
            sectorIdentifierUri: TEST_CLIENT.sector_identifier_uri,
            postLogoutRedirectUris: TEST_CLIENT.postLogoutUris,
            claims: TEST_CLIENT.claims,
            displayedKey: TEST_STATIC_KEY_UPDATE.public_key,
            idTokenSigningAlgorithm: TEST_CLIENT.id_token_signing_algorithm,
            identityVerificationSupported: TEST_CLIENT.identity_verification_supported,
            maxAgeEnabled: TEST_CLIENT.max_age_enabled,
            pkceEnforced: TEST_CLIENT.pkce_enforced,
            landingPageUrl: TEST_LANDING_PAGE_URL,
            levelsOfConfidence: TEST_LEVELS_OF_CONFIDENCE,
            contacts: TEST_CLIENT.contacts,
            urls: {
                changeClientName: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${
                    TEST_CLIENT.dynamoServiceId
                }/change-client-name?clientName=${encodeURIComponent(TEST_CLIENT.clientName)}`,
                changeRedirectUris: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/change-redirect-uris`,
                changeKeyUri: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${
                    TEST_CLIENT.dynamoServiceId
                }/change-public-key?publicKeySource=${TEST_CLIENT.publicKeySource}&publicKey=${encodeURIComponent(
                    TEST_CLIENT.publicKey
                )}&jwksUrl=${encodeURIComponent(TEST_CLIENT.jwksUri)}`,
                changePostLogoutUris: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/change-post-logout-uris`,
                changeBackChannelLogoutUri: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${
                    TEST_CLIENT.dynamoServiceId
                }/change-back-channel-logout-uri?backChannelLogoutUri=${encodeURIComponent(TEST_CLIENT.back_channel_logout_uri as string)}`,
                changeSectorIdentifierUri: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${
                    TEST_CLIENT.dynamoServiceId
                }/change-sector-identifier-uri?sectorIdentifierUri=${encodeURIComponent(TEST_CLIENT.sector_identifier_uri)}`,
                changeContacts: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/enter-contact`,
                changeIdVerificationEnabledUri: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/enter-identity-verification`,
                changeIdTokenSigningAlgorithm:
                    "/services/service#123/clients/ajedebd2343/456/change-id-token-signing-algorithm?algorithm=ES256",
                changeClaims: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/change-claims?claims=${TEST_CLAIM}`,
                changeScopes: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/change-scopes?scopes=${TEST_SCOPES_IN[0]}`,
                changeMaxAgeEnabled: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/change-max-age-enabled`,
                changePKCEEnforcedUri: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/change-pkce-enforced`,
                changeLandingPageUrl: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${
                    TEST_CLIENT.dynamoServiceId
                }/change-landing-page-url?landingPageUrl=${encodeURIComponent(TEST_CLIENT.landing_page_url as string)}`
            },
            basicAuthCreds: {
                username: TEST_BASIC_AUTH_USERNAME,
                password: TEST_BASIC_AUTH_PASSWORD
            }
        });
        expect(mockRequest.session.serviceName).toStrictEqual(TEST_CLIENT.serviceName);
        expect(mockRequest.session.updatedField).toBeUndefined();
    });

    it("calls render with an empty array when claims is undefined", async () => {
        s4ListClientsSpy.mockResolvedValue([{...TEST_CLIENT, claims: undefined}]);

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
            authMethod: TEST_CLIENT.token_endpoint_auth_method,
            clientId: TEST_CLIENT.authClientId,
            selfServiceClientId: TEST_CLIENT.dynamoServiceId,
            serviceId: TEST_SERVICE_ID,
            serviceName: TEST_CLIENT.serviceName,
            successBannerMessage: undefined,
            redirectUris: TEST_CLIENT.redirectUris,
            scopesRequired: TEST_CLIENT.scopes,
            userPublicKey: TEST_CLIENT.publicKey,
            backChannelLogoutUri: TEST_CLIENT.back_channel_logout_uri,
            sectorIdentifierUri: TEST_CLIENT.sector_identifier_uri,
            postLogoutRedirectUris: TEST_CLIENT.postLogoutUris,
            claims: [],
            displayedKey: TEST_STATIC_KEY_UPDATE.public_key,
            idTokenSigningAlgorithm: TEST_CLIENT.id_token_signing_algorithm,
            identityVerificationSupported: TEST_CLIENT.identity_verification_supported,
            pkceEnforced: TEST_CLIENT.pkce_enforced,
            landingPageUrl: TEST_LANDING_PAGE_URL,
            contacts: TEST_CLIENT.contacts,
            levelsOfConfidence: TEST_LEVELS_OF_CONFIDENCE,
            token_endpoint_auth_method: TEST_CLIENT.token_endpoint_auth_method,
            maxAgeEnabled: TEST_CLIENT.max_age_enabled,
            urls: {
                changeIdTokenSigningAlgorithm: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/change-id-token-signing-algorithm?algorithm=${TEST_ID_SIGNING_TOKEN_ALGORITHM}`,
                changeClientName: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${
                    TEST_CLIENT.dynamoServiceId
                }/change-client-name?clientName=${encodeURIComponent(TEST_CLIENT.clientName)}`,
                changeRedirectUris: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/change-redirect-uris`,
                changeKeyUri: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${
                    TEST_CLIENT.dynamoServiceId
                }/change-public-key?publicKeySource=${TEST_CLIENT.publicKeySource}&publicKey=${encodeURIComponent(
                    TEST_CLIENT.publicKey
                )}&jwksUrl=${encodeURIComponent(TEST_CLIENT.jwksUri)}`,
                changePostLogoutUris: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/change-post-logout-uris`,
                changeBackChannelLogoutUri: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${
                    TEST_CLIENT.dynamoServiceId
                }/change-back-channel-logout-uri?backChannelLogoutUri=${encodeURIComponent(TEST_CLIENT.back_channel_logout_uri as string)}`,
                changeSectorIdentifierUri: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${
                    TEST_CLIENT.dynamoServiceId
                }/change-sector-identifier-uri?sectorIdentifierUri=${encodeURIComponent(TEST_CLIENT.sector_identifier_uri)}`,
                changeContacts: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/enter-contact`,
                changeIdVerificationEnabledUri: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/enter-identity-verification`,
                changeMaxAgeEnabled: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/change-max-age-enabled`,
                changeClaims: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/change-claims?claims=`,
                changeScopes: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/change-scopes?scopes=${TEST_SCOPES_IN[0]}`,
                changePKCEEnforcedUri: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/change-pkce-enforced`,
                changeLandingPageUrl: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${
                    TEST_CLIENT.dynamoServiceId
                }/change-landing-page-url?landingPageUrl=${encodeURIComponent(TEST_CLIENT.landing_page_url as string)}`
            },
            basicAuthCreds: {
                username: TEST_BASIC_AUTH_USERNAME,
                password: TEST_BASIC_AUTH_PASSWORD
            }
        });
        expect(mockRequest.session.serviceName).toStrictEqual(TEST_CLIENT.serviceName);
        expect(mockRequest.session.updatedField).toBeUndefined();
    });

    it("calls render with an empty array when client_locs is undefined", async () => {
        s4ListClientsSpy.mockResolvedValue([{...TEST_CLIENT, client_locs: undefined}]);

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
            authMethod: TEST_CLIENT.token_endpoint_auth_method,
            clientId: TEST_CLIENT.authClientId,
            selfServiceClientId: TEST_CLIENT.dynamoServiceId,
            serviceId: TEST_SERVICE_ID,
            serviceName: TEST_CLIENT.serviceName,
            successBannerMessage: undefined,
            redirectUris: TEST_CLIENT.redirectUris,
            scopesRequired: TEST_CLIENT.scopes,
            userPublicKey: TEST_CLIENT.publicKey,
            backChannelLogoutUri: TEST_CLIENT.back_channel_logout_uri,
            sectorIdentifierUri: TEST_CLIENT.sector_identifier_uri,
            postLogoutRedirectUris: TEST_CLIENT.postLogoutUris,
            claims: TEST_CLIENT.claims,
            displayedKey: TEST_STATIC_KEY_UPDATE.public_key,
            idTokenSigningAlgorithm: TEST_CLIENT.id_token_signing_algorithm,
            maxAgeEnabled: TEST_CLIENT.max_age_enabled,
            identityVerificationSupported: TEST_CLIENT.identity_verification_supported,
            pkceEnforced: TEST_CLIENT.pkce_enforced,
            landingPageUrl: TEST_LANDING_PAGE_URL,
            contacts: TEST_CLIENT.contacts,
            levelsOfConfidence: "",
            token_endpoint_auth_method: TEST_CLIENT.token_endpoint_auth_method,
            urls: {
                changeIdTokenSigningAlgorithm: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/change-id-token-signing-algorithm?algorithm=${TEST_ID_SIGNING_TOKEN_ALGORITHM}`,
                changeClientName: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${
                    TEST_CLIENT.dynamoServiceId
                }/change-client-name?clientName=${encodeURIComponent(TEST_CLIENT.clientName)}`,
                changeRedirectUris: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/change-redirect-uris`,
                changeKeyUri: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${
                    TEST_CLIENT.dynamoServiceId
                }/change-public-key?publicKeySource=${TEST_CLIENT.publicKeySource}&publicKey=${encodeURIComponent(
                    TEST_CLIENT.publicKey
                )}&jwksUrl=${encodeURIComponent(TEST_CLIENT.jwksUri)}`,
                changePostLogoutUris: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/change-post-logout-uris`,
                changeBackChannelLogoutUri: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${
                    TEST_CLIENT.dynamoServiceId
                }/change-back-channel-logout-uri?backChannelLogoutUri=${encodeURIComponent(TEST_CLIENT.back_channel_logout_uri as string)}`,
                changeSectorIdentifierUri: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${
                    TEST_CLIENT.dynamoServiceId
                }/change-sector-identifier-uri?sectorIdentifierUri=${encodeURIComponent(TEST_CLIENT.sector_identifier_uri)}`,
                changeContacts: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/enter-contact`,
                changeIdVerificationEnabledUri: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/enter-identity-verification`,
                changeMaxAgeEnabled: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/change-max-age-enabled`,
                changeClaims: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/change-claims?claims=${TEST_CLIENT.claims}`,
                changeScopes: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/change-scopes?scopes=${TEST_SCOPES_IN[0]}`,
                changePKCEEnforcedUri: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/change-pkce-enforced`,
                changeLandingPageUrl: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${
                    TEST_CLIENT.dynamoServiceId
                }/change-landing-page-url?landingPageUrl=${encodeURIComponent(TEST_CLIENT.landing_page_url as string)}`
            },
            basicAuthCreds: {
                username: TEST_BASIC_AUTH_USERNAME,
                password: TEST_BASIC_AUTH_PASSWORD
            }
        });
        expect(mockRequest.session.serviceName).toStrictEqual(TEST_CLIENT.serviceName);
        expect(mockRequest.session.updatedField).toBeUndefined();
    });

    it("includes public key is blank if not set on the client", async () => {
        s4ListClientsSpy.mockResolvedValue([{...TEST_CLIENT, publicKey: defaultPublicKey}]);

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
            authMethod: TEST_CLIENT.token_endpoint_auth_method,
            clientId: TEST_CLIENT.authClientId,
            selfServiceClientId: TEST_CLIENT.dynamoServiceId,
            serviceId: TEST_SERVICE_ID,
            serviceName: TEST_CLIENT.serviceName,
            token_endpoint_auth_method: TEST_TOKEN_AUTH_METHOD,
            successBannerMessage: undefined,
            redirectUris: TEST_CLIENT.redirectUris,
            scopesRequired: TEST_CLIENT.scopes,
            userPublicKey: "",
            backChannelLogoutUri: TEST_CLIENT.back_channel_logout_uri,
            sectorIdentifierUri: TEST_CLIENT.sector_identifier_uri,
            postLogoutRedirectUris: TEST_CLIENT.postLogoutUris,
            claims: TEST_CLIENT.claims,
            displayedKey: "",
            idTokenSigningAlgorithm: TEST_CLIENT.id_token_signing_algorithm,
            maxAgeEnabled: TEST_CLIENT.max_age_enabled,
            identityVerificationSupported: TEST_CLIENT.identity_verification_supported,
            pkceEnforced: TEST_CLIENT.pkce_enforced,
            landingPageUrl: TEST_LANDING_PAGE_URL,
            levelsOfConfidence: TEST_LEVELS_OF_CONFIDENCE,
            contacts: TEST_CLIENT.contacts,
            urls: {
                changeClientName: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${
                    TEST_CLIENT.dynamoServiceId
                }/change-client-name?clientName=${encodeURIComponent(TEST_CLIENT.clientName)}`,
                changeRedirectUris: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/change-redirect-uris`,
                changeKeyUri: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${
                    TEST_CLIENT.dynamoServiceId
                }/change-public-key?publicKeySource=${TEST_CLIENT.publicKeySource}&publicKey=&jwksUrl=${encodeURIComponent(
                    TEST_CLIENT.jwksUri
                )}`,
                changePostLogoutUris: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/change-post-logout-uris`,
                changeBackChannelLogoutUri: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${
                    TEST_CLIENT.dynamoServiceId
                }/change-back-channel-logout-uri?backChannelLogoutUri=${encodeURIComponent(TEST_CLIENT.back_channel_logout_uri as string)}`,
                changeSectorIdentifierUri: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${
                    TEST_CLIENT.dynamoServiceId
                }/change-sector-identifier-uri?sectorIdentifierUri=${encodeURIComponent(TEST_CLIENT.sector_identifier_uri)}`,
                changeContacts: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/enter-contact`,
                changeIdVerificationEnabledUri: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/enter-identity-verification`,
                changeMaxAgeEnabled: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/change-max-age-enabled`,
                changeIdTokenSigningAlgorithm:
                    "/services/service#123/clients/ajedebd2343/456/change-id-token-signing-algorithm?algorithm=ES256",
                changeClaims: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/change-claims?claims=${TEST_CLAIM}`,
                changeScopes: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/change-scopes?scopes=${TEST_SCOPES_IN[0]}`,
                changePKCEEnforcedUri: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/change-pkce-enforced`,
                changeLandingPageUrl: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${
                    TEST_CLIENT.dynamoServiceId
                }/change-landing-page-url?landingPageUrl=${encodeURIComponent(TEST_CLIENT.landing_page_url as string)}`
            },
            basicAuthCreds: {
                username: TEST_BASIC_AUTH_USERNAME,
                password: TEST_BASIC_AUTH_PASSWORD
            }
        });
        expect(mockRequest.session.serviceName).toStrictEqual(TEST_CLIENT.serviceName);
        expect(mockRequest.session.updatedField).toBeUndefined();
    });

    it("includes client_secret in the render options if the token_endpoint_auth_method is client_secret_post", async () => {
        s4ListClientsSpy.mockResolvedValue([{...TEST_CLIENT, token_endpoint_auth_method: TEST_TOKEN_AUTH_METHOD_ALT}]);

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
            authMethod: TEST_TOKEN_AUTH_METHOD_ALT,
            clientId: TEST_CLIENT.authClientId,
            selfServiceClientId: TEST_CLIENT.dynamoServiceId,
            serviceId: TEST_SERVICE_ID,
            serviceName: TEST_CLIENT.serviceName,
            token_endpoint_auth_method: TEST_TOKEN_AUTH_METHOD_ALT,
            successBannerMessage: undefined,
            redirectUris: TEST_CLIENT.redirectUris,
            scopesRequired: TEST_CLIENT.scopes,
            client_secret: TEST_CLIENT.client_secret,
            backChannelLogoutUri: TEST_CLIENT.back_channel_logout_uri,
            sectorIdentifierUri: TEST_CLIENT.sector_identifier_uri,
            postLogoutRedirectUris: TEST_CLIENT.postLogoutUris,
            claims: TEST_CLIENT.claims,
            displayedKey: TEST_SECRET_HASH,
            idTokenSigningAlgorithm: TEST_CLIENT.id_token_signing_algorithm,
            identityVerificationSupported: TEST_CLIENT.identity_verification_supported,
            maxAgeEnabled: TEST_CLIENT.max_age_enabled,
            pkceEnforced: TEST_CLIENT.pkce_enforced,
            landingPageUrl: TEST_LANDING_PAGE_URL,
            levelsOfConfidence: TEST_LEVELS_OF_CONFIDENCE,
            contacts: TEST_CLIENT.contacts,
            urls: {
                changeClientName: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${
                    TEST_CLIENT.dynamoServiceId
                }/change-client-name?clientName=${encodeURIComponent(TEST_CLIENT.clientName)}`,
                changeRedirectUris: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/change-redirect-uris`,
                changeKeyUri: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${
                    TEST_CLIENT.dynamoServiceId
                }/enter-client-secret-hash?secretHash=${encodeURIComponent(TEST_SECRET_HASH)}`,
                changePostLogoutUris: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/change-post-logout-uris`,
                changeBackChannelLogoutUri: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${
                    TEST_CLIENT.dynamoServiceId
                }/change-back-channel-logout-uri?backChannelLogoutUri=${encodeURIComponent(TEST_CLIENT.back_channel_logout_uri as string)}`,
                changeSectorIdentifierUri: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${
                    TEST_CLIENT.dynamoServiceId
                }/change-sector-identifier-uri?sectorIdentifierUri=${encodeURIComponent(TEST_CLIENT.sector_identifier_uri)}`,

                changeContacts: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/enter-contact`,
                changeIdVerificationEnabledUri: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/enter-identity-verification`,
                changeMaxAgeEnabled: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/change-max-age-enabled`,
                changeIdTokenSigningAlgorithm:
                    "/services/service#123/clients/ajedebd2343/456/change-id-token-signing-algorithm?algorithm=ES256",
                changeClaims: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/change-claims?claims=${TEST_CLAIM}`,
                changeScopes: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/change-scopes?scopes=${TEST_SCOPES_IN[0]}`,
                changePKCEEnforcedUri: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/change-pkce-enforced`,
                changeLandingPageUrl: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${
                    TEST_CLIENT.dynamoServiceId
                }/change-landing-page-url?landingPageUrl=${encodeURIComponent(TEST_CLIENT.landing_page_url as string)}`
            },
            basicAuthCreds: {
                username: TEST_BASIC_AUTH_USERNAME,
                password: TEST_BASIC_AUTH_PASSWORD
            }
        });
        expect(mockRequest.session.serviceName).toStrictEqual(TEST_CLIENT.serviceName);
        expect(mockRequest.session.updatedField).toBeUndefined();
    });

    it("includes client_secret is blank if not set on the client", async () => {
        s4ListClientsSpy.mockResolvedValue([
            {...TEST_CLIENT, token_endpoint_auth_method: TEST_TOKEN_AUTH_METHOD_ALT, client_secret: undefined}
        ]);

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
            authMethod: TEST_TOKEN_AUTH_METHOD_ALT,
            clientId: TEST_CLIENT.authClientId,
            selfServiceClientId: TEST_CLIENT.dynamoServiceId,
            serviceId: TEST_SERVICE_ID,
            serviceName: TEST_CLIENT.serviceName,
            token_endpoint_auth_method: TEST_TOKEN_AUTH_METHOD_ALT,
            successBannerMessage: undefined,
            redirectUris: TEST_CLIENT.redirectUris,
            scopesRequired: TEST_CLIENT.scopes,
            client_secret: "",
            backChannelLogoutUri: TEST_CLIENT.back_channel_logout_uri,
            sectorIdentifierUri: TEST_CLIENT.sector_identifier_uri,
            postLogoutRedirectUris: TEST_CLIENT.postLogoutUris,
            claims: TEST_CLIENT.claims,
            displayedKey: "",
            idTokenSigningAlgorithm: TEST_CLIENT.id_token_signing_algorithm,
            identityVerificationSupported: TEST_CLIENT.identity_verification_supported,
            maxAgeEnabled: TEST_CLIENT.max_age_enabled,
            pkceEnforced: TEST_CLIENT.pkce_enforced,
            landingPageUrl: TEST_LANDING_PAGE_URL,
            levelsOfConfidence: TEST_LEVELS_OF_CONFIDENCE,
            contacts: TEST_CLIENT.contacts,
            urls: {
                changeClientName: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${
                    TEST_CLIENT.dynamoServiceId
                }/change-client-name?clientName=${encodeURIComponent(TEST_CLIENT.clientName)}`,
                changeRedirectUris: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/change-redirect-uris`,
                changeKeyUri: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${
                    TEST_CLIENT.dynamoServiceId
                }/enter-client-secret-hash?secretHash=${encodeURIComponent("")}`,
                changePostLogoutUris: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/change-post-logout-uris`,
                changeBackChannelLogoutUri: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${
                    TEST_CLIENT.dynamoServiceId
                }/change-back-channel-logout-uri?backChannelLogoutUri=${encodeURIComponent(TEST_CLIENT.back_channel_logout_uri as string)}`,
                changeSectorIdentifierUri: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${
                    TEST_CLIENT.dynamoServiceId
                }/change-sector-identifier-uri?sectorIdentifierUri=${encodeURIComponent(TEST_CLIENT.sector_identifier_uri)}`,

                changeContacts: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/enter-contact`,
                changeIdVerificationEnabledUri: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/enter-identity-verification`,
                changeMaxAgeEnabled: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/change-max-age-enabled`,
                changeIdTokenSigningAlgorithm:
                    "/services/service#123/clients/ajedebd2343/456/change-id-token-signing-algorithm?algorithm=ES256",
                changeClaims: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/change-claims?claims=${TEST_CLAIM}`,
                changeScopes: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/change-scopes?scopes=${TEST_SCOPES_IN[0]}`,
                changePKCEEnforcedUri: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/change-pkce-enforced`,
                changeLandingPageUrl: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${
                    TEST_CLIENT.dynamoServiceId
                }/change-landing-page-url?landingPageUrl=${encodeURIComponent(TEST_CLIENT.landing_page_url as string)}`
            },
            basicAuthCreds: {
                username: TEST_BASIC_AUTH_USERNAME,
                password: TEST_BASIC_AUTH_PASSWORD
            }
        });
        expect(mockRequest.session.serviceName).toStrictEqual(TEST_CLIENT.serviceName);
        expect(mockRequest.session.updatedField).toBeUndefined();
    });

    it("includes claims is empty if identityVerificationSupported is disabled", async () => {
        s4ListClientsSpy.mockResolvedValue([{...TEST_CLIENT, identity_verification_supported: false}]);

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
            authMethod: TEST_CLIENT.token_endpoint_auth_method,
            clientId: TEST_CLIENT.authClientId,
            selfServiceClientId: TEST_CLIENT.dynamoServiceId,
            serviceId: TEST_SERVICE_ID,
            serviceName: TEST_CLIENT.serviceName,
            token_endpoint_auth_method: TEST_TOKEN_AUTH_METHOD,
            successBannerMessage: undefined,
            redirectUris: TEST_CLIENT.redirectUris,
            scopesRequired: TEST_CLIENT.scopes,
            userPublicKey: TEST_CLIENT.publicKey,
            backChannelLogoutUri: TEST_CLIENT.back_channel_logout_uri,
            sectorIdentifierUri: TEST_CLIENT.sector_identifier_uri,
            postLogoutRedirectUris: TEST_CLIENT.postLogoutUris,
            claims: [],
            displayedKey: TEST_STATIC_KEY_UPDATE.public_key,
            idTokenSigningAlgorithm: TEST_CLIENT.id_token_signing_algorithm,
            maxAgeEnabled: TEST_CLIENT.max_age_enabled,
            identityVerificationSupported: false,
            pkceEnforced: false,
            landingPageUrl: TEST_LANDING_PAGE_URL,
            contacts: TEST_CLIENT.contacts,
            urls: {
                changeClientName: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${
                    TEST_CLIENT.dynamoServiceId
                }/change-client-name?clientName=${encodeURIComponent(TEST_CLIENT.clientName)}`,
                changeRedirectUris: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/change-redirect-uris`,
                changeKeyUri: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${
                    TEST_CLIENT.dynamoServiceId
                }/change-public-key?publicKeySource=${TEST_CLIENT.publicKeySource}&publicKey=${encodeURIComponent(
                    TEST_CLIENT.publicKey
                )}&jwksUrl=${encodeURIComponent(TEST_CLIENT.jwksUri)}`,
                changePostLogoutUris: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/change-post-logout-uris`,
                changeBackChannelLogoutUri: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${
                    TEST_CLIENT.dynamoServiceId
                }/change-back-channel-logout-uri?backChannelLogoutUri=${encodeURIComponent(TEST_CLIENT.back_channel_logout_uri as string)}`,
                changeSectorIdentifierUri: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${
                    TEST_CLIENT.dynamoServiceId
                }/change-sector-identifier-uri?sectorIdentifierUri=${encodeURIComponent(TEST_CLIENT.sector_identifier_uri)}`,

                changeContacts: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/enter-contact`,
                changeIdVerificationEnabledUri: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/enter-identity-verification`,
                changeMaxAgeEnabled: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/change-max-age-enabled`,
                changeIdTokenSigningAlgorithm:
                    "/services/service#123/clients/ajedebd2343/456/change-id-token-signing-algorithm?algorithm=ES256",
                changeClaims: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/change-claims?claims=`,
                changeScopes: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/change-scopes?scopes=${TEST_SCOPES_IN[0]}`,
                changePKCEEnforcedUri: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${TEST_CLIENT.dynamoServiceId}/change-pkce-enforced`,
                changeLandingPageUrl: `/services/${TEST_SERVICE_ID}/clients/${TEST_CLIENT.authClientId}/${
                    TEST_CLIENT.dynamoServiceId
                }/change-landing-page-url?landingPageUrl=${encodeURIComponent(TEST_CLIENT.landing_page_url as string)}`
            },
            basicAuthCreds: {
                username: TEST_BASIC_AUTH_USERNAME,
                password: TEST_BASIC_AUTH_PASSWORD
            }
        });
        expect(mockRequest.session.serviceName).toStrictEqual(TEST_CLIENT.serviceName);
        expect(mockRequest.session.updatedField).toBeUndefined();
    });
});

describe("showGoLivePage controller tests", () => {
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

        showGoLivePage(mockRequest, mockResponse, mockNext);

        expect(mockResponse.render).toHaveBeenCalledWith("clients/go-live.njk", {
            serviceId: TEST_SERVICE_ID,
            selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
            clientId: TEST_CLIENT_ID,
            serviceName: TEST_SERVICE_NAME,
            emailAddress: TEST_EMAIL
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
                publicKeySource: TEST_STATIC_KEY_UPDATE.public_key_source,
                publicKey: TEST_STATIC_KEY_UPDATE.public_key,
                jwksUrl: ""
            }
        });
        const mockResponse = response();

        showChangePublicKeyForm(mockRequest, mockResponse, mockNext);
        expect(mockResponse.render).toHaveBeenCalledWith("clients/change-public-key.njk", {
            serviceId: TEST_SERVICE_ID,
            selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
            clientId: TEST_CLIENT_ID,
            publicKeySource: TEST_STATIC_KEY_UPDATE.public_key_source,
            serviceUserPublicKey: TEST_STATIC_KEY_UPDATE.public_key,
            jwksUrl: ""
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
                update: TEST_STATIC_KEY_UPDATE
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
            TEST_STATIC_KEY_UPDATE,
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
                update: TEST_STATIC_KEY_UPDATE
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
            TEST_STATIC_KEY_UPDATE,
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
            {back_channel_logout_uri: TEST_BACK_CHANNEL_LOGOUT_URI},
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

describe("processChangePublicKey controller tests", () => {
    const s4UpdateClientSpy = jest.spyOn(SelfServiceServicesService.prototype, "updateClient");
    const s4SendTxMALogSpy = jest.spyOn(SelfServiceServicesService.prototype, "sendTxMALog");

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers().setSystemTime(TEST_TIMESTAMP);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("calls s4 change the public key and adds the value, sends a TxMA log and then redirects to /clients", async () => {
        s4UpdateClientSpy.mockResolvedValue();
        s4SendTxMALogSpy.mockReturnValue();
        AuthenticationResultParser.getCognitoId = jest.fn().mockReturnValue(TEST_COGNITO_ID);

        const mockReq = request({
            body: {
                update: TEST_STATIC_KEY_UPDATE
            },
            params: {
                selfServiceClientId: "",
                clientId: TEST_CLIENT_ID
            },
            context: {
                serviceId: TEST_SERVICE_ID
            },
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT,
                id: TEST_SESSION_ID
            },
            ip: TEST_IP_ADDRESS
        });
        const mockRes = response();
        const mockNext = jest.fn();
        await processChangePublicKeyForm(mockReq, mockRes, mockNext);

        expect(s4UpdateClientSpy).toHaveBeenCalledWith(TEST_SERVICE_ID, "", TEST_CLIENT_ID, TEST_STATIC_KEY_UPDATE, TEST_ACCESS_TOKEN);
        expect(s4SendTxMALogSpy).toHaveBeenCalledWith(
            "SSE_PUBLIC_KEY_ADDED",
            {
                session_id: TEST_SESSION_ID,
                user_id: TEST_COGNITO_ID,
                ip_address: TEST_IP_ADDRESS
            },
            {service_id: TEST_SERVICE_ID}
        );
        expect(mockReq.session.updatedField).toStrictEqual("public key");
        expect(mockRes.redirect).toHaveBeenCalledWith("/services/" + TEST_SERVICE_ID + "/clients");
    });

    it("calls s4 change the static public key and updates the value, sends a TxMA log and then redirects to /clients", async () => {
        s4UpdateClientSpy.mockResolvedValue();
        s4SendTxMALogSpy.mockReturnValue();
        AuthenticationResultParser.getCognitoId = jest.fn().mockReturnValue(TEST_COGNITO_ID);

        const mockReq = request({
            body: {
                update: TEST_STATIC_KEY_UPDATE
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            context: {
                serviceId: TEST_SERVICE_ID
            },
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT,
                id: TEST_SESSION_ID
            },
            ip: TEST_IP_ADDRESS
        });
        const mockRes = response();
        const mockNext = jest.fn();
        await processChangePublicKeyForm(mockReq, mockRes, mockNext);

        expect(s4UpdateClientSpy).toHaveBeenCalledWith(
            TEST_SERVICE_ID,
            TEST_SELF_SERVICE_CLIENT_ID,
            TEST_CLIENT_ID,
            TEST_STATIC_KEY_UPDATE,
            TEST_ACCESS_TOKEN
        );
        expect(s4SendTxMALogSpy).toHaveBeenCalledWith(
            "SSE_UPDATE_PUBLIC_KEY",
            {
                session_id: TEST_SESSION_ID,
                user_id: TEST_COGNITO_ID,
                ip_address: TEST_IP_ADDRESS
            },
            {service_id: TEST_SERVICE_ID}
        );
        expect(mockReq.session.updatedField).toStrictEqual("public key");
        expect(mockRes.redirect).toHaveBeenCalledWith("/services/" + TEST_SERVICE_ID + "/clients");
    });
});

describe("showChangeScopesForm controller tests for executing form", () => {
    const changeScopesForm = "clients/change-scopes.njk";
    const mockRes = response();
    const s4ResultSpy = jest.spyOn(mockRes, "render");

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers().setSystemTime(TEST_TIMESTAMP);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("calls s4 scopes controller", async () => {
        const mockReq = request({
            query: {
                scopes: TEST_SCOPES_IN
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            context: {
                serviceId: TEST_SERVICE_ID
            },
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT,
                id: TEST_SESSION_ID
            },
            ip: TEST_IP_ADDRESS
        });
        const mockNext = jest.fn();

        showChangeScopesForm(mockReq, mockRes, mockNext);
        expect(s4ResultSpy).toHaveBeenCalledWith(changeScopesForm, {
            clientId: TEST_CLIENT_ID,
            selectedScopes: TEST_SCOPES_IN.toString().split(" "),
            selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
            serviceId: TEST_SERVICE_ID
        });
    });
});

describe("processChangeScopesForm controller tests for updating key", () => {
    const s4UpdateClientSpy = jest.spyOn(SelfServiceServicesService.prototype, "updateClient");
    const s4SendTxMALogSpy = jest.spyOn(SelfServiceServicesService.prototype, "sendTxMALog");

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers().setSystemTime(TEST_TIMESTAMP);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("calls s4 change array of scopes and updates the value and then redirects to /clients", async () => {
        s4UpdateClientSpy.mockResolvedValue();
        s4SendTxMALogSpy.mockReturnValue();
        AuthenticationResultParser.getCognitoId = jest.fn().mockReturnValue(TEST_COGNITO_ID);

        const mockReq = request({
            body: {
                scopes: TEST_SCOPES_IN
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            context: {
                serviceId: TEST_SERVICE_ID
            },
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT,
                id: TEST_SESSION_ID
            },
            ip: TEST_IP_ADDRESS
        });
        const mockRes = response();
        const mockNext = jest.fn();
        await processChangeScopesForm(mockReq, mockRes, mockNext);

        expect(s4UpdateClientSpy).toHaveBeenCalledWith(
            TEST_SERVICE_ID,
            TEST_SELF_SERVICE_CLIENT_ID,
            TEST_CLIENT_ID,
            {scopes: TEST_SCOPES_OUT},
            TEST_ACCESS_TOKEN
        );
        expect(mockReq.session.updatedField).toStrictEqual("scopes");
        expect(mockRes.redirect).toHaveBeenCalledWith("/services/" + TEST_SERVICE_ID + "/clients");
    });

    it("calls s4 change single scope and updates the value and then redirects to /clients", async () => {
        s4UpdateClientSpy.mockResolvedValue();
        s4SendTxMALogSpy.mockReturnValue();
        AuthenticationResultParser.getCognitoId = jest.fn().mockReturnValue(TEST_COGNITO_ID);

        const mockReq = request({
            body: {
                scopes: TEST_SCOPES_IN[0]
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            context: {
                serviceId: TEST_SERVICE_ID
            },
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT,
                id: TEST_SESSION_ID
            },
            ip: TEST_IP_ADDRESS
        });
        const mockRes = response();
        const mockNext = jest.fn();
        await processChangeScopesForm(mockReq, mockRes, mockNext);

        expect(s4UpdateClientSpy).toHaveBeenCalledWith(
            TEST_SERVICE_ID,
            TEST_SELF_SERVICE_CLIENT_ID,
            TEST_CLIENT_ID,
            {scopes: TEST_SCOPES_OUT2},
            TEST_ACCESS_TOKEN
        );
        expect(mockReq.session.updatedField).toStrictEqual("scopes");
        expect(mockRes.redirect).toHaveBeenCalledWith("/services/" + TEST_SERVICE_ID + "/clients");
    });
});

describe("showChangeClaimsForm controller tests for executing form", () => {
    const changeClaimsForm = "clients/change-claims.njk";
    const mockRes = response();
    const s4ResultSpy = jest.spyOn(mockRes, "render");

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers().setSystemTime(TEST_TIMESTAMP);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("calls s4 claims controller", async () => {
        const mockReq = request({
            query: {
                claims: TEST_CLAIMS
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            context: {
                serviceId: TEST_SERVICE_ID
            },
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT,
                id: TEST_SESSION_ID
            },
            ip: TEST_IP_ADDRESS
        });
        const mockNext = jest.fn();

        showChangeClaimsForm(mockReq, mockRes, mockNext);
        expect(s4ResultSpy).toHaveBeenCalledWith(changeClaimsForm, {
            clientId: TEST_CLIENT_ID,
            claims: TEST_CLAIMS.toString().split(" "),
            selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
            serviceId: TEST_SERVICE_ID
        });
    });
});

describe("processChangeClaimsForm controller tests for updating key", () => {
    const s4UpdateClientSpy = jest.spyOn(SelfServiceServicesService.prototype, "updateClient");
    const s4SendTxMALogSpy = jest.spyOn(SelfServiceServicesService.prototype, "sendTxMALog");

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers().setSystemTime(TEST_TIMESTAMP);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("calls s4 change array of claims and updates the value and then redirects to /clients", async () => {
        s4UpdateClientSpy.mockResolvedValue();
        s4SendTxMALogSpy.mockReturnValue();
        AuthenticationResultParser.getCognitoId = jest.fn().mockReturnValue(TEST_COGNITO_ID);

        const mockReq = request({
            body: {
                claims: TEST_CLAIMS
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            context: {
                serviceId: TEST_SERVICE_ID
            },
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT,
                id: TEST_SESSION_ID
            },
            ip: TEST_IP_ADDRESS
        });
        const mockRes = response();
        const mockNext = jest.fn();
        await processChangeClaimsForm(mockReq, mockRes, mockNext);

        expect(s4UpdateClientSpy).toHaveBeenCalledWith(
            TEST_SERVICE_ID,
            TEST_SELF_SERVICE_CLIENT_ID,
            TEST_CLIENT_ID,
            {claims: TEST_CLAIMS},
            TEST_ACCESS_TOKEN
        );
        expect(mockReq.session.updatedField).toStrictEqual("claims");
        expect(mockRes.redirect).toHaveBeenCalledWith("/services/" + TEST_SERVICE_ID + "/clients");
    });

    it("calls s4 change single claim and updates the value and then redirects to /clients", async () => {
        s4UpdateClientSpy.mockResolvedValue();
        s4SendTxMALogSpy.mockReturnValue();
        AuthenticationResultParser.getCognitoId = jest.fn().mockReturnValue(TEST_COGNITO_ID);

        const mockReq = request({
            body: {
                claims: TEST_CLAIMS[0]
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            context: {
                serviceId: TEST_SERVICE_ID
            },
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT,
                id: TEST_SESSION_ID
            },
            ip: TEST_IP_ADDRESS
        });
        const mockRes = response();
        const mockNext = jest.fn();
        await processChangeClaimsForm(mockReq, mockRes, mockNext);

        expect(s4UpdateClientSpy).toHaveBeenCalledWith(
            TEST_SERVICE_ID,
            TEST_SELF_SERVICE_CLIENT_ID,
            TEST_CLIENT_ID,
            {claims: [TEST_CLAIMS[0]]},
            TEST_ACCESS_TOKEN
        );
        expect(mockReq.session.updatedField).toStrictEqual("claims");
        expect(mockRes.redirect).toHaveBeenCalledWith("/services/" + TEST_SERVICE_ID + "/clients");
    });
});

describe("processChangePublicKey controller tests", () => {
    const s4UpdateClientSpy = jest.spyOn(SelfServiceServicesService.prototype, "updateClient");
    const s4SendTxMALogSpy = jest.spyOn(SelfServiceServicesService.prototype, "sendTxMALog");

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers().setSystemTime(TEST_TIMESTAMP);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("calls s4 change the public key and adds the value, sends a TxMA log and then redirects to /clients", async () => {
        s4UpdateClientSpy.mockResolvedValue();
        s4SendTxMALogSpy.mockReturnValue();
        AuthenticationResultParser.getCognitoId = jest.fn().mockReturnValue(TEST_COGNITO_ID);

        const mockReq = request({
            body: {
                update: TEST_STATIC_KEY_UPDATE
            },
            params: {
                selfServiceClientId: "",
                clientId: TEST_CLIENT_ID
            },
            context: {
                serviceId: TEST_SERVICE_ID
            },
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT,
                id: TEST_SESSION_ID
            },
            ip: TEST_IP_ADDRESS
        });
        const mockRes = response();
        const mockNext = jest.fn();
        await processChangePublicKeyForm(mockReq, mockRes, mockNext);

        expect(s4UpdateClientSpy).toHaveBeenCalledWith(TEST_SERVICE_ID, "", TEST_CLIENT_ID, TEST_STATIC_KEY_UPDATE, TEST_ACCESS_TOKEN);
        expect(s4SendTxMALogSpy).toHaveBeenCalledWith(
            "SSE_PUBLIC_KEY_ADDED",
            {
                session_id: TEST_SESSION_ID,
                user_id: TEST_COGNITO_ID,
                ip_address: TEST_IP_ADDRESS
            },
            {service_id: TEST_SERVICE_ID}
        );
        expect(mockReq.session.updatedField).toStrictEqual("public key");
        expect(mockRes.redirect).toHaveBeenCalledWith("/services/" + TEST_SERVICE_ID + "/clients");
    });

    it("calls s4 change the public key and updates the value, sends a TxMA log and then redirects to /clients", async () => {
        s4UpdateClientSpy.mockResolvedValue();
        s4SendTxMALogSpy.mockReturnValue();
        AuthenticationResultParser.getCognitoId = jest.fn().mockReturnValue(TEST_COGNITO_ID);

        const mockRequest = request({
            context: {
                serviceId: TEST_SERVICE_ID
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            query: {
                secretHash: TEST_SECRET_HASH
            }
        });
        const mockResponse = response();

        showEnterClientSecretHashForm(mockRequest, mockResponse, mockNext);

        expect(mockResponse.render).toHaveBeenCalledWith("clients/enter-client-secret-hash.njk", {
            serviceId: TEST_SERVICE_ID,
            selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
            clientId: TEST_CLIENT_ID,
            secretHash: mockRequest.query.secretHash
        });
    });
});

describe("processEnterClientSecretHashForm controller tests", () => {
    const s4UpdateClientSpy = jest.spyOn(SelfServiceServicesService.prototype, "updateClient");
    const s4SendTxMALogSpy = jest.spyOn(SelfServiceServicesService.prototype, "sendTxMALog");

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers().setSystemTime(TEST_TIMESTAMP);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("calls s4 change the secret hash and adds the value, sends a TxMA log and then redirects to /clients", async () => {
        s4UpdateClientSpy.mockResolvedValue();
        s4SendTxMALogSpy.mockReturnValue();
        AuthenticationResultParser.getCognitoId = jest.fn().mockReturnValue(TEST_COGNITO_ID);

        const mockReq = request({
            body: {
                secretHash: TEST_SECRET_HASH
            },
            params: {
                selfServiceClientId: "",
                clientId: TEST_CLIENT_ID
            },
            context: {
                serviceId: TEST_SERVICE_ID
            },
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT,
                id: TEST_SESSION_ID
            },
            ip: TEST_IP_ADDRESS
        });
        const mockRes = response();
        const mockNext = jest.fn();
        await processEnterClientSecretHashForm(mockReq, mockRes, mockNext);

        expect(s4UpdateClientSpy).toHaveBeenCalledWith(
            TEST_SERVICE_ID,
            "",
            TEST_CLIENT_ID,
            {client_secret: TEST_SECRET_HASH},
            TEST_ACCESS_TOKEN
        );
        expect(s4SendTxMALogSpy).toHaveBeenCalledWith(
            "SSE_SECRET_HASH_ADDED",
            {
                session_id: TEST_SESSION_ID,
                user_id: TEST_COGNITO_ID,
                ip_address: TEST_IP_ADDRESS
            },
            {service_id: TEST_SERVICE_ID}
        );
        expect(mockReq.session.updatedField).toStrictEqual("secret hash");
        expect(mockRes.redirect).toHaveBeenCalledWith("/services/" + TEST_SERVICE_ID + "/clients");
    });

    it("calls s4 change the secret hash and updates the value, sends a TxMA log and then redirects to /clients", async () => {
        s4UpdateClientSpy.mockResolvedValue();
        s4SendTxMALogSpy.mockReturnValue();
        AuthenticationResultParser.getCognitoId = jest.fn().mockReturnValue(TEST_COGNITO_ID);

        const mockReq = request({
            body: {
                secretHash: TEST_SECRET_HASH
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            context: {
                serviceId: TEST_SERVICE_ID
            },
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT,
                id: TEST_SESSION_ID
            },
            ip: TEST_IP_ADDRESS
        });
        const mockRes = response();
        const mockNext = jest.fn();
        await processEnterClientSecretHashForm(mockReq, mockRes, mockNext);

        expect(s4UpdateClientSpy).toHaveBeenCalledWith(
            TEST_SERVICE_ID,
            TEST_SELF_SERVICE_CLIENT_ID,
            TEST_CLIENT_ID,
            {client_secret: TEST_SECRET_HASH},
            TEST_ACCESS_TOKEN
        );
        expect(s4SendTxMALogSpy).toHaveBeenCalledWith(
            "SSE_UPDATE_SECRET_HASH",
            {
                session_id: TEST_SESSION_ID,
                user_id: TEST_COGNITO_ID,
                ip_address: TEST_IP_ADDRESS
            },
            {service_id: TEST_SERVICE_ID}
        );
        expect(mockReq.session.updatedField).toStrictEqual("secret hash");
        expect(mockRes.redirect).toHaveBeenCalledWith("/services/" + TEST_SERVICE_ID + "/clients");
    });
});

describe("processChangeClaimsForm controller tests for updating key", () => {
    const s4UpdateClientSpy = jest.spyOn(SelfServiceServicesService.prototype, "updateClient");
    const s4SendTxMALogSpy = jest.spyOn(SelfServiceServicesService.prototype, "sendTxMALog");

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers().setSystemTime(TEST_TIMESTAMP);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("calls s4 change array of claims and updates the value and then redirects to /clients", async () => {
        s4UpdateClientSpy.mockResolvedValue();
        s4SendTxMALogSpy.mockReturnValue();
        AuthenticationResultParser.getCognitoId = jest.fn().mockReturnValue(TEST_COGNITO_ID);

        const mockReq = request({
            body: {
                scopes: TEST_CLAIMS
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            context: {
                serviceId: TEST_SERVICE_ID
            },
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT,
                id: TEST_SESSION_ID
            },
            ip: TEST_IP_ADDRESS
        });
        const mockRes = response();
        const mockNext = jest.fn();
        await processChangeScopesForm(mockReq, mockRes, mockNext);

        expect(s4UpdateClientSpy).toHaveBeenCalledWith(
            TEST_SERVICE_ID,
            TEST_SELF_SERVICE_CLIENT_ID,
            TEST_CLIENT_ID,
            {scopes: TEST_CLAIMS_OUT},
            TEST_ACCESS_TOKEN
        );
        expect(mockReq.session.updatedField).toStrictEqual("scopes");
        expect(mockRes.redirect).toHaveBeenCalledWith("/services/" + TEST_SERVICE_ID + "/clients");
    });

    it("calls s4 change single claim and updates the value and then redirects to /clients", async () => {
        s4UpdateClientSpy.mockResolvedValue();
        s4SendTxMALogSpy.mockReturnValue();
        AuthenticationResultParser.getCognitoId = jest.fn().mockReturnValue(TEST_COGNITO_ID);

        const mockReq = request({
            body: {
                scopes: TEST_CLAIMS[0]
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            context: {
                serviceId: TEST_SERVICE_ID
            },
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT,
                id: TEST_SESSION_ID
            },
            ip: TEST_IP_ADDRESS
        });
        const mockRes = response();
        const mockNext = jest.fn();
        await processChangeScopesForm(mockReq, mockRes, mockNext);

        expect(s4UpdateClientSpy).toHaveBeenCalledWith(
            TEST_SERVICE_ID,
            TEST_SELF_SERVICE_CLIENT_ID,
            TEST_CLIENT_ID,
            {scopes: TEST_CLAIMS_OUT2},
            TEST_ACCESS_TOKEN
        );
        expect(mockReq.session.updatedField).toStrictEqual("scopes");
        expect(mockRes.redirect).toHaveBeenCalledWith("/services/" + TEST_SERVICE_ID + "/clients");
    });
});

describe("showEnterIdentityVerificationForm controller tests", () => {
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

        showEnterIdentityVerificationForm(mockRequest, mockResponse, mockNext);

        expect(mockResponse.render).toHaveBeenCalledWith("clients/enter-identity-verification.njk", {
            serviceId: TEST_SERVICE_ID,
            selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
            clientId: TEST_CLIENT_ID
        });
    });
});

describe("processEnterIdentityVerificationForm controller tests for updating flag", () => {
    const s4UpdateClientSpy = jest.spyOn(SelfServiceServicesService.prototype, "updateClient");

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("calls s4 change this flag to true and updates the value and then redirects to /clients", async () => {
        s4UpdateClientSpy.mockResolvedValue();

        const mockReq = request({
            body: {
                identityVerificationSupported: TEST_BOOLEAN_SUPPORTED_TX
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            context: {
                serviceId: TEST_SERVICE_ID
            },
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT,
                id: TEST_SESSION_ID
            },
            ip: TEST_IP_ADDRESS
        });
        const mockRes = response();
        await processEnterIdentityVerificationForm(mockReq, mockRes);

        expect(s4UpdateClientSpy).toHaveBeenCalledWith(
            TEST_SERVICE_ID,
            TEST_SELF_SERVICE_CLIENT_ID,
            TEST_CLIENT_ID,
            {
                accepted_levels_of_confidence: [TEST_LEVELS_OF_CONFIDENCE],
                identity_verification_supported: TEST_BOOLEAN_SUPPORTED
            },
            TEST_ACCESS_TOKEN
        );

        expect(mockReq.session.updatedField).toStrictEqual("identity verification");
        expect(mockRes.redirect).toHaveBeenCalledWith("/services/" + TEST_SERVICE_ID + "/clients");
    });

    it("calls s4 change this flag to false and updates the value and then redirects to /clients", async () => {
        s4UpdateClientSpy.mockResolvedValue();

        const mockReq = request({
            body: {
                identityVerificationSupported: TEST_BOOLEAN_SUPPORTED_ALT_TX
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            context: {
                serviceId: TEST_SERVICE_ID
            },
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT,
                id: TEST_SESSION_ID
            },
            ip: TEST_IP_ADDRESS
        });
        const mockRes = response();
        await processEnterIdentityVerificationForm(mockReq, mockRes);

        expect(s4UpdateClientSpy).toHaveBeenCalledWith(
            TEST_SERVICE_ID,
            TEST_SELF_SERVICE_CLIENT_ID,
            TEST_CLIENT_ID,
            {
                accepted_levels_of_confidence: [TEST_LEVELS_OF_CONFIDENCE_ALT],
                identity_verification_supported: TEST_BOOLEAN_SUPPORTED_ALT
            },
            TEST_ACCESS_TOKEN
        );

        expect(mockReq.session.updatedField).toStrictEqual("identity verification");
        expect(mockRes.redirect).toHaveBeenCalledWith("/services/" + TEST_SERVICE_ID + "/clients");
    });

    it("does not call s4 and re-renders the same template if the user submits without selecting an option", async () => {
        s4UpdateClientSpy.mockResolvedValue();

        const mockReq = request({
            body: {},
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            context: {
                serviceId: TEST_SERVICE_ID
            },
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT,
                id: TEST_SESSION_ID
            },
            ip: TEST_IP_ADDRESS
        });
        const mockRes = response();
        await processEnterIdentityVerificationForm(mockReq, mockRes);

        expect(s4UpdateClientSpy).not.toHaveBeenCalled();
        expect(mockRes.render).toHaveBeenCalledWith("clients/enter-identity-verification.njk", {
            serviceId: TEST_SERVICE_ID,
            selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
            clientId: TEST_CLIENT_ID,
            errorMessages: {
                "identityVerificationSupported-options": "Select yes if you want to enable identity verification"
            }
        });
    });
});

describe("showChangePKCEEnforcedForm controller tests", () => {
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

        showChangePKCEEnforcedForm(mockRequest, mockResponse, mockNext);

        expect(mockResponse.render).toHaveBeenCalledWith("clients/change-pkce-enforced.njk", {
            serviceId: TEST_SERVICE_ID,
            selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
            clientId: TEST_CLIENT_ID
        });
    });
});

describe("processChangePKCEEnforcedForm controller tests for updating flag", () => {
    const s4UpdateClientSpy = jest.spyOn(SelfServiceServicesService.prototype, "updateClient");

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("calls s4 change this flag to true and updates the value and then redirects to /clients", async () => {
        s4UpdateClientSpy.mockResolvedValue();

        const mockReq = request({
            body: {
                pkceEnforced: TEST_BOOLEAN_SUPPORTED_TX
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            context: {
                serviceId: TEST_SERVICE_ID
            },
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT,
                id: TEST_SESSION_ID
            },
            ip: TEST_IP_ADDRESS
        });
        const mockRes = response();
        await processChangePKCEEnforcedForm(mockReq, mockRes);

        expect(s4UpdateClientSpy).toHaveBeenCalledWith(
            TEST_SERVICE_ID,
            TEST_SELF_SERVICE_CLIENT_ID,
            TEST_CLIENT_ID,
            {
                pkce_enforced: TEST_BOOLEAN_SUPPORTED
            },
            TEST_ACCESS_TOKEN
        );

        expect(mockReq.session.updatedField).toStrictEqual("PKCE enforced");
        expect(mockRes.redirect).toHaveBeenCalledWith("/services/" + TEST_SERVICE_ID + "/clients");
    });

    it("calls s4 change this flag to false and updates the value and then redirects to /clients", async () => {
        s4UpdateClientSpy.mockResolvedValue();

        const mockReq = request({
            body: {
                pkceEnforced: TEST_BOOLEAN_SUPPORTED_ALT_TX
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            context: {
                serviceId: TEST_SERVICE_ID
            },
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT,
                id: TEST_SESSION_ID
            },
            ip: TEST_IP_ADDRESS
        });
        const mockRes = response();
        await processChangePKCEEnforcedForm(mockReq, mockRes);

        expect(s4UpdateClientSpy).toHaveBeenCalledWith(
            TEST_SERVICE_ID,
            TEST_SELF_SERVICE_CLIENT_ID,
            TEST_CLIENT_ID,
            {
                pkce_enforced: TEST_BOOLEAN_SUPPORTED_ALT
            },
            TEST_ACCESS_TOKEN
        );

        expect(mockReq.session.updatedField).toStrictEqual("PKCE enforced");
        expect(mockRes.redirect).toHaveBeenCalledWith("/services/" + TEST_SERVICE_ID + "/clients");
    });

    it("does not call s4 and re-renders the same template if the user submits without selecting an option", async () => {
        s4UpdateClientSpy.mockResolvedValue();

        const mockReq = request({
            body: {},
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            context: {
                serviceId: TEST_SERVICE_ID
            },
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT,
                id: TEST_SESSION_ID
            },
            ip: TEST_IP_ADDRESS
        });
        const mockRes = response();
        await processChangePKCEEnforcedForm(mockReq, mockRes);

        expect(s4UpdateClientSpy).not.toHaveBeenCalled();
        expect(mockRes.render).toHaveBeenCalledWith("clients/change-pkce-enforced.njk", {
            serviceId: TEST_SERVICE_ID,
            selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
            clientId: TEST_CLIENT_ID,
            errorMessages: {
                "pkceEnforced-options": "Select yes if you want to enforce PKCE"
            }
        });
    });
});

describe("showChangeClientName controller tests", () => {
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
                clientName: TEST_CLIENT_NAME
            }
        });
        const mockResponse = response();

        showChangeClientName(mockRequest, mockResponse, mockNext);

        expect(mockResponse.render).toHaveBeenCalledWith("clients/change-client-name.njk", {
            serviceId: TEST_SERVICE_ID,
            selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
            clientId: TEST_CLIENT_ID,
            values: {
                clientName: TEST_CLIENT_NAME
            }
        });
    });
});

describe("processChangeClientName controller tests", () => {
    const s4UpdateClientSpy = jest.spyOn(SelfServiceServicesService.prototype, "updateClient");

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, "error");
    });

    it("calls s4 updateClient with the new client name and redirects to /clients", async () => {
        s4UpdateClientSpy.mockResolvedValue();

        const mockRequest = request({
            context: {
                serviceId: TEST_SERVICE_ID
            },
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT,
                id: TEST_SESSION_ID
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            body: {
                clientName: TEST_CLIENT_NAME
            }
        });
        const mockResponse = response();

        await processChangeClientName(mockRequest, mockResponse);

        expect(s4UpdateClientSpy).toHaveBeenCalledWith(
            TEST_SERVICE_ID,
            TEST_SELF_SERVICE_CLIENT_ID,
            TEST_CLIENT_ID,
            {client_name: TEST_CLIENT_NAME},
            TEST_ACCESS_TOKEN
        );

        expect(mockRequest.session.updatedField).toStrictEqual("client name");
        expect(mockResponse.redirect).toHaveBeenCalledWith("/services/" + TEST_SERVICE_ID + "/clients");
    });

    it("re-renders the template with error messages if the client name is empty", async () => {
        s4UpdateClientSpy.mockResolvedValue();

        const mockRequest = request({
            context: {
                serviceId: TEST_SERVICE_ID
            },
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT,
                id: TEST_SESSION_ID
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            body: {
                clientName: ""
            }
        });
        const mockResponse = response();

        await processChangeClientName(mockRequest, mockResponse);

        expect(s4UpdateClientSpy).not.toHaveBeenCalled();

        expect(mockRequest.session.updatedField).toBeUndefined();
        expect(mockResponse.render).toHaveBeenCalledWith("clients/change-client-name.njk", {
            serviceId: TEST_SERVICE_ID,
            selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
            clientId: TEST_CLIENT_ID,
            errorMessages: {
                clientName: "Enter your client name"
            }
        });
    });

    it("redirects to /there-is-a-problem if s4UpdateClient throws an error", async () => {
        const err = "someError";
        s4UpdateClientSpy.mockRejectedValue(err);

        const mockRequest = request({
            context: {
                serviceId: TEST_SERVICE_ID
            },
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT,
                id: TEST_SESSION_ID
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            body: {
                clientName: TEST_CLIENT_NAME
            }
        });
        const mockResponse = response();

        await processChangeClientName(mockRequest, mockResponse);

        expect(s4UpdateClientSpy).toHaveBeenCalledWith(
            TEST_SERVICE_ID,
            TEST_SELF_SERVICE_CLIENT_ID,
            TEST_CLIENT_ID,
            {client_name: TEST_CLIENT_NAME},
            TEST_ACCESS_TOKEN
        );
        expect(mockRequest.session.updatedField).toBeUndefined();
        expect(console.error).toHaveBeenCalledWith(err);
        expect(mockResponse.redirect).toHaveBeenCalledWith("/there-is-a-problem");
    });
});

describe("showMaxAgeEnabled controller tests", () => {
    const mockRequest = request({
        context: {
            serviceId: TEST_SERVICE_ID
        },
        params: {
            selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
            clientId: TEST_CLIENT_ID
        },
        query: {
            clientName: TEST_CLIENT_NAME
        }
    });
    const mockResponse = response();

    showMaxAgeEnabledForm(mockRequest, mockResponse, mockNext);

    expect(mockResponse.render).toHaveBeenCalledWith("clients/enter-max-age.njk", {
        serviceId: TEST_SERVICE_ID,
        selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
        clientId: TEST_CLIENT_ID
    });
});

describe("processMaxAgeEnabled controller tests for updating flag", () => {
    const s4UpdateClientSpy = jest.spyOn(SelfServiceServicesService.prototype, "updateClient");

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("calls s4 change this flag to true and updates the value and then redirects to /clients", async () => {
        s4UpdateClientSpy.mockResolvedValue();

        const mockReq = request({
            body: {
                maxAgeEnabled: TEST_BOOLEAN_SUPPORTED_TX
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            context: {
                serviceId: TEST_SERVICE_ID
            },
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT,
                id: TEST_SESSION_ID
            },
            ip: TEST_IP_ADDRESS
        });
        const mockRes = response();
        await processMaxAgeEnabledForm(mockReq, mockRes);

        expect(s4UpdateClientSpy).toHaveBeenCalledWith(
            TEST_SERVICE_ID,
            TEST_SELF_SERVICE_CLIENT_ID,
            TEST_CLIENT_ID,
            {max_age_enabled: TEST_BOOLEAN_SUPPORTED},
            TEST_ACCESS_TOKEN
        );

        expect(mockReq.session.updatedField).toStrictEqual("Max Age Enabled");
        expect(mockRes.redirect).toHaveBeenCalledWith("/services/" + TEST_SERVICE_ID + "/clients");
    });

    it("calls s4 change this flag to false and updates the value and then redirects to /clients", async () => {
        s4UpdateClientSpy.mockResolvedValue();

        const mockReq = request({
            body: {
                maxAgeEnabled: TEST_BOOLEAN_SUPPORTED_ALT_TX
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            context: {
                serviceId: TEST_SERVICE_ID
            },
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT,
                id: TEST_SESSION_ID
            },
            ip: TEST_IP_ADDRESS
        });
        const mockRes = response();
        await processMaxAgeEnabledForm(mockReq, mockRes);

        expect(s4UpdateClientSpy).toHaveBeenCalledWith(
            TEST_SERVICE_ID,
            TEST_SELF_SERVICE_CLIENT_ID,
            TEST_CLIENT_ID,
            {max_age_enabled: TEST_BOOLEAN_SUPPORTED_ALT},
            TEST_ACCESS_TOKEN
        );

        expect(mockReq.session.updatedField).toStrictEqual("Max Age Enabled");
        expect(mockRes.redirect).toHaveBeenCalledWith("/services/" + TEST_SERVICE_ID + "/clients");
    });

    it("does not call s4 and re-renders the same template if the user submits without selecting an option", async () => {
        s4UpdateClientSpy.mockResolvedValue();

        const mockReq = request({
            body: {},
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            context: {
                serviceId: TEST_SERVICE_ID
            },
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT,
                id: TEST_SESSION_ID
            },
            ip: TEST_IP_ADDRESS
        });
        const mockRes = response();
        await processMaxAgeEnabledForm(mockReq, mockRes);

        expect(s4UpdateClientSpy).not.toHaveBeenCalled();
        expect(mockRes.render).toHaveBeenCalledWith("clients/enter-max-age.njk", {
            serviceId: TEST_SERVICE_ID,
            selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
            clientId: TEST_CLIENT_ID,
            errorMessages: {
                "maxAgeEnabled-options": "Select yes if you want to enable Max Age"
            }
        });
    });
});
describe("showChangeLandingPageUrlForm controller tests", () => {
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
                landingPageUrl: TEST_LANDING_PAGE_URL
            }
        });
        const mockResponse = response();

        showChangeLandingPageUrlForm(mockRequest, mockResponse, mockNext);

        expect(mockResponse.render).toHaveBeenCalledWith("clients/change-landing-page-url.njk", {
            serviceId: TEST_SERVICE_ID,
            selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
            clientId: TEST_CLIENT_ID,
            values: {
                landingPageUrl: TEST_LANDING_PAGE_URL
            }
        });
    });
});

describe("processChangeLandingPageUrlForm controller tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("calls s4 update client with the new landing page url and then redirects to`/services/:serviceId/clients", async () => {
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
                landingPageUrl: TEST_LANDING_PAGE_URL
            },
            context: {
                serviceId: TEST_SERVICE_ID
            }
        });
        const mockResponse = response();

        await processChangeLandingPageUrlForm(mockRequest, mockResponse, mockNext);

        expect(s4UpdateClientSpy).toHaveBeenCalledWith(
            TEST_SERVICE_ID,
            TEST_SELF_SERVICE_CLIENT_ID,
            TEST_CLIENT_ID,
            {landing_page_url: TEST_LANDING_PAGE_URL},
            TEST_AUTHENTICATION_RESULT.AccessToken
        );
        expect(mockRequest.session.updatedField).toBe("Landing page URI");
        expect(mockResponse.redirect).toHaveBeenCalledWith(`/services/${TEST_SERVICE_ID}/clients`);
    });
});
