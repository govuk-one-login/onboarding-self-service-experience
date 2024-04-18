export const TEST_TEMPLATE_PATH = "some/template/to/render";
export const TEST_PASSWORD = "somePassword";
export const TEST_EMAIL = "someEmail";
export const TEST_SESSION_ID = "someSessionId";
export const TEST_IP_ADDRESS = "1.1.1.1";
export const TEST_PHONE_NUMBER = "+4413456789";
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
export const TEST_AUTHENTICATION_RESULT = {
    AccessToken: "someAccessToken",
    ExpiresIn: 12345,
    TokenType: "SomeTokenType",
    RefreshToken: "someRefreshToken",
    IdToken: "someIdToken"
};
export const TEST_SPREAD_SHEET_ID = "someSpreadSheetId";
export const TEST_HEADER_RANGE = "someHeaderRange";
export const TEST_DATA_RANGE = "someDataRange";
export const TEST_DATA_TO_APPEND = new Map<string, string>([["hello", "World"]]);
export const TEST_SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
export const TEST_JWT = JSON.stringify({
    email: TEST_EMAIL,
    scopes: TEST_SCOPES
});

export const constructFakeJwt = (jwtBody: Record<string, unknown>): string =>
    "someHeader." + Buffer.from(JSON.stringify(jwtBody)).toString("base64") + ".someSignature";
