import {OnboardingTableItem} from "../@types/OnboardingTableItem";
import {Service} from "../@types/Service";

export const TEST_TEMPLATE_PATH = "some/template/to/render";
export const TEST_PASSWORD = "somePassword";
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
export const TEST_ACCESS_TOKEN = "someAccessToken";
export const TEST_REFRESH_TOKEN = "someRefreshToken";
export const TEST_AUTHENTICATION_RESULT = {
    AccessToken: TEST_ACCESS_TOKEN,
    ExpiresIn: 12345,
    TokenType: "SomeTokenType",
    RefreshToken: "someRefreshToken",
    IdToken: "someIdToken"
};
export const TEST_SIGN_UP_STATUS = "someStatus";
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
    id: "12334",
    fullName: TEST_FULL_NAME,
    firstName: TEST_FIRST_NAME,
    lastName: TEST_LAST_NAME,
    email: TEST_EMAIL,
    mobileNumber: TEST_PHONE_NUMBER,
    passwordLastUpdated: "2024-04-19T14:41:18.754Z"
};
export const TEST_SERVICE_ID = "service#123";
export const TEST_SERVICE: Service = {
    id: TEST_SERVICE_ID,
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
export const TEST_SELF_SERVICE_CLIENT_ID = "someSelfServiceClientId";

export const constructFakeJwt = (jwtBody: Record<string, unknown>): string =>
    "someHeader." + Buffer.from(JSON.stringify(jwtBody)).toString("base64") + ".someSignature";
