import {SignupStatusStage} from "../src/lib/utils/signup-status";
import {OnboardingTableItem} from "../@types/OnboardingTableItem";
import {Service, ServiceFromDynamo} from "../@types/Service";
import {DynamoUser} from "../@types/user";
import {Client} from "../@types/client";

export const TEST_TEMPLATE_PATH = "some/template/to/render";
export const TEST_PASSWORD = "somePassword";
export const TEST_USER_ID = "1ded3d65-d088-4319-9431-ea5a3323799d";
export const TEST_EMAIL = "someEmail";
export const TEST_SESSION_ID = "someSessionId";
export const TEST_IP_ADDRESS = "1.1.1.1";
export const TEST_PHONE_NUMBER = "+4413456789";
export const TEST_CURRENT_PASSWORD = "superSecurePassword123";
export const TEST_NEW_PASSWORD = "superSecurePassword456";
export const TEST_FIRST_NAME = "firstName";
export const TEST_LAST_NAME = "lastName";
export const TEST_FULL_NAME = `${TEST_FIRST_NAME} ${TEST_LAST_NAME}`;
export const TEST_HOST_NAME = "someHost";
export const TEST_PROTOCOL = "https";
export const TEST_TIMESTAMP = 1713537678754;
export const TEST_TIMESTAMP_STRING = "2024-04-19T15:41:18.754";
export const TEST_DYNAMO_USER = {
    pk: {S: "user#12345"},
    phone: {S: TEST_PHONE_NUMBER}
};
export const TEST_COGNITO_SESSION = "session";
export const TEST_COGNITO_ID = "someId";
export const TEST_MFA_RESPONSE = {
    cognitoSession: TEST_COGNITO_SESSION,
    cognitoId: TEST_COGNITO_ID,
    codeSentTo: TEST_PHONE_NUMBER
};
export const TEST_SECURITY_CODE = "123456";
export const TEST_ACCESS_TOKEN = `.${Buffer.from(JSON.stringify({sub: TEST_USER_ID})).toString("base64url")}.`;
export const TEST_REFRESH_TOKEN = "someRefreshToken";
export const TEST_ID_TOKEN = "1.2.3";
export const TEST_AUTHENTICATION_RESULT = {
    AccessToken: TEST_ACCESS_TOKEN,
    ExpiresIn: 12345,
    TokenType: "SomeTokenType",
    RefreshToken: "someRefreshToken",
    IdToken: TEST_ID_TOKEN
};
export const TEST_SIGN_UP_STATUS = "HasEmail,HasPassword";
export const TEST_SIGN_UP_STATUS_STAGE = SignupStatusStage.HasEmail;
export const TEST_COGNITO_SESSION_STRING = "session9fee3263-ced5-4a0d-9b8a-d640646286c5";
export const TEST_UUID = "eb93a770-fff9-4145-9773-343aee098d83";
export const TEST_SERVICE_NAME = "someTestService";
export const TEST_SPREAD_SHEET_ID = "someSpreadSheetId";
export const TEST_HEADER_RANGE = "someHeaderRange";
export const TEST_DATA_RANGE = "someDataRange";
export const TEST_DATA_TO_APPEND = new Map<string, string>([["hello", "World"]]);
export const TEST_SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
export const TEST_JWT = JSON.stringify({
    email: TEST_EMAIL,
    scopes: TEST_SCOPES
});
export const TEST_USER = {
    id: TEST_USER_ID.substring("user#".length),
    fullName: TEST_FULL_NAME,
    firstName: TEST_FIRST_NAME,
    lastName: TEST_LAST_NAME,
    email: TEST_EMAIL,
    mobileNumber: TEST_PHONE_NUMBER,
    passwordLastUpdated: "2024-04-19T14:41:18.754Z"
};

export const TEST_USER_FROM_DYNAMO: DynamoUser = {
    pk: {S: TEST_USER_ID},
    sk: {S: TEST_COGNITO_ID},
    data: {S: TEST_FULL_NAME},
    first_name: {S: TEST_FIRST_NAME},
    last_name: {S: TEST_LAST_NAME},
    email: {S: TEST_EMAIL},
    phone: {S: TEST_PHONE_NUMBER},
    password_last_updated: {S: "2024-04-19T14:41:18.754Z"}
};
export const TEST_SERVICE_ID = "service#123";
export const TEST_SERVICE: Service = {
    id: TEST_SERVICE_ID.substring("service#".length),
    serviceName: TEST_SERVICE_NAME
};
export const TEST_RANDOM_NUMBER = 123456;
export const TEST_CLIENT_ID = "ajedebd2343";
export const TEST_COGNITO_CLIENT_ID = "c5cdaf0c-f92d-4ef7-922e";
export const TEST_COGNITO_USER_POOL_ID = "1234-abcd-1234567890ab";
export const TEST_AWS_REGION = "someRegion";
export const TEST_API_BASE_URL = "some.base.url";
export const TEST_ONBOARDING_TABLE_ITEM: OnboardingTableItem = {
    pk: TEST_SERVICE_ID,
    sk: TEST_CLIENT_ID
};
export const TEST_SERVICE_FROM_DYNAMO: ServiceFromDynamo = {
    pk: {S: TEST_SERVICE_ID},
    sk: {S: TEST_USER_ID},
    data: {S: ""},
    service_name: {S: TEST_SERVICE_NAME}
};
export const TEST_SELF_SERVICE_CLIENT_ID = "someSelfServiceClientId";
export const TEST_SCOPES_IN = ["email", "phone"];
export const TEST_SCOPES_OUT = ["openid", "email", "phone"];
export const TEST_SCOPES_OUT2 = ["openid", "email"];
export const TEST_BAD_PUBLIC_KEY = "BAD KEY";

export const TEST_STATIC_KEY_UPDATE = {
    public_key_source: "STATIC",
    public_key:
        "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCeQ90Vm6wnW9AYqRTj4bHiFLHWHe1w1u6CaQnkWYeL1q5LCyWofFb0hNZt7h70ZKDvmyDy3Rfw0qwGY9P49neZQJEkSj/VLGrqWhHJEq9Bi4xKxtTo2as8c+uNP8uede6fRTGIO5miaaiR4dhHdViWE2v8LDx0vWkBAi30Ry3kowIDAQAB"
};

export const TEST_JWKS_KEY_UPDATE = {
    public_key_source: "JWKS",
    jwks_uri: "https://www.example.com/"
};

export const TEST_SECRET_HASH = "A secret";
export const TEST_DYNAMO_ID = "client#456";
export const TEST_CLIENT_NAME = "someClientName";
export const TEST_REDIRECT_URI = "someRedirectURI";
export const TEST_POST_LOGOUT_REDIRECT_URI = "somePostLogOutRedirectURI";
export const TEST_SERVICE_TYPE = "serviceType";
export const TEST_SUBJECT_TYPE = "subject";
export const TEST_BACK_CHANNEL_LOGOUT_URI = "someBackChannel";
export const TEST_SECTOR_IDENTIFIER_URI = "someSectorIdentifier";
export const TEST_LANDING_PAGE_URL = "someLandingPageUrl";
export const TEST_TOKEN_AUTH_METHOD = "private_key_jwt";
export const TEST_TOKEN_AUTH_METHOD_ALT = "client_secret_post";
export const TEST_TYPE = "someType";
export const TEST_BOOLEAN_SUPPORTED = true;
export const TEST_BOOLEAN_SUPPORTED_TX = "yes";
export const TEST_BOOLEAN_SUPPORTED_ALT = false;
export const TEST_BOOLEAN_SUPPORTED_ALT_TX = "no";
export const TEST_CLAIM = "someClaims";
export const TEST_CLAIMS = ["cl1", "cl2"];
export const TEST_CLAIMS_OUT = ["openid", "cl1", "cl2"];
export const TEST_CLAIMS_OUT2 = ["openid", "cl1"];
export const TEST_DEFAULT_FIELD = "someFields";
export const TEST_ID_SIGNING_TOKEN_ALGORITHM = "ES256";

export const TEST_DYNAMO_CLIENT = {
    pk: {S: TEST_SERVICE_ID},
    sk: {S: TEST_DYNAMO_ID},
    clientId: {S: TEST_CLIENT_ID},
    contacts: {L: [{S: TEST_EMAIL}]},
    default_fields: {L: [{S: TEST_DEFAULT_FIELD}]},
    post_logout_redirect_uris: {L: [{S: TEST_POST_LOGOUT_REDIRECT_URI}]},
    public_key_source: {S: TEST_STATIC_KEY_UPDATE.public_key_source},
    public_key: {S: TEST_STATIC_KEY_UPDATE.public_key},
    jwks_uri: {S: TEST_JWKS_KEY_UPDATE.jwks_uri},
    redirect_uris: {L: [{S: TEST_REDIRECT_URI}]},
    scopes: {L: [{S: TEST_SCOPES_IN[0]}]},
    client_name: {S: TEST_CLIENT_NAME},
    service_name: {S: TEST_SERVICE_NAME},
    service_type: {S: TEST_SERVICE_TYPE},
    subject_type: {S: TEST_SUBJECT_TYPE},
    back_channel_logout_uri: {S: TEST_BACK_CHANNEL_LOGOUT_URI},
    sector_identifier_uri: {S: TEST_SECTOR_IDENTIFIER_URI},
    token_endpoint_auth_method: {S: TEST_TOKEN_AUTH_METHOD},
    client_secret: {S: TEST_SECRET_HASH},
    type: {S: TEST_TYPE},
    identity_verification_supported: {B: TEST_BOOLEAN_SUPPORTED},
    claims: {L: [{S: TEST_CLAIM}]},
    id_token_signing_algorithm: {S: TEST_ID_SIGNING_TOKEN_ALGORITHM},
    max_age_enabled: {B: TEST_BOOLEAN_SUPPORTED_ALT},
    pkce_enforced: {B: TEST_BOOLEAN_SUPPORTED_ALT},
    landing_page_url: {S: TEST_LANDING_PAGE_URL}
};

export const TEST_CLIENT: Client = {
    dynamoId: TEST_SERVICE_ID.substring("service#".length),
    dynamoServiceId: TEST_DYNAMO_ID.substring("client#".length),
    authClientId: TEST_CLIENT_ID,
    contacts: [TEST_EMAIL],
    defaultFields: [TEST_DEFAULT_FIELD],
    postLogoutUris: [TEST_POST_LOGOUT_REDIRECT_URI],
    publicKeySource: TEST_STATIC_KEY_UPDATE.public_key_source,
    publicKey: TEST_STATIC_KEY_UPDATE.public_key,
    jwksUri: TEST_JWKS_KEY_UPDATE.jwks_uri,
    redirectUris: [TEST_REDIRECT_URI],
    scopes: [TEST_SCOPES_IN[0]],
    clientName: TEST_CLIENT_NAME,
    serviceName: TEST_SERVICE_NAME,
    serviceType: TEST_SERVICE_TYPE,
    subjectType: TEST_SUBJECT_TYPE,
    back_channel_logout_uri: TEST_BACK_CHANNEL_LOGOUT_URI,
    sector_identifier_uri: TEST_SECTOR_IDENTIFIER_URI,
    token_endpoint_auth_method: TEST_TOKEN_AUTH_METHOD,
    client_secret: TEST_SECRET_HASH,
    type: TEST_TYPE,
    identity_verification_supported: TEST_BOOLEAN_SUPPORTED,
    claims: [TEST_CLAIM],
    id_token_signing_algorithm: TEST_ID_SIGNING_TOKEN_ALGORITHM,
    max_age_enabled: TEST_BOOLEAN_SUPPORTED_ALT,
    pkce_enforced: TEST_BOOLEAN_SUPPORTED_ALT,
    landing_page_url: TEST_LANDING_PAGE_URL
};

export const constructFakeJwt = (jwtBody: Record<string, unknown>): string =>
    "someHeader." + Buffer.from(JSON.stringify(jwtBody)).toString("base64") + ".someSignature";

export const TEST_HELMET_CONFIG = {
    referrerPolicy: {
        policy: ["strict-origin"]
    },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://www.googletagmanager.com",
                "https://www.google-analytics.com",
                "https://ssl.google-analytics.com"
            ],
            styleSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https://www.googletagmanager.com", "https://www.google-analytics.com"],
            objectSrc: ["'none'"],
            connectSrc: ["'self'", "https://www.google-analytics.com"],
            formAction: ["'self'"]
        }
    },
    dnsPrefetchControl: {
        allow: false
    },
    frameguard: {
        action: "deny"
    },
    hsts: {
        maxAge: 31536000, // 1 Year
        preload: true,
        includeSubDomains: true
    },
    permittedCrossDomainPolicies: false
};

export const TEST_PUBLIC_BETA_FORM_SUBMISSION = {
    userName: TEST_FULL_NAME,
    role: "Testing",
    organisationName: "Test",
    serviceUrl: "test.gov.uk",
    serviceDescription: "Some users for stuff",
    serviceUse: "signUsersInAndCheckIdentity",
    migrateExistingAccounts: "yes",
    numberOfUsersEachYear: "rangeOver1Million",
    "targetDate-day": "12",
    "targetDate-month": "12",
    "targetDate-year": "1212",
    serviceName: TEST_SERVICE_NAME
};

export const TEST_USER_ATTRIBUTES = ["phone", "email"];
