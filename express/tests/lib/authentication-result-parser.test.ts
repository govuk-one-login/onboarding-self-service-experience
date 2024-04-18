import AuthenticationResultParser from "../../src/lib/authentication-result-parser";
import {constructFakeJwt} from "../constants";

describe("AuthenticationResultParser tests", () => {
    it("getRefreshToken method tests", () => {
        const TEST_REFRESH_TOKEN = "Hello there!";
        const mockAuthenticationResult = {
            RefreshToken: TEST_REFRESH_TOKEN
        };
        expect(AuthenticationResultParser.getRefreshToken(mockAuthenticationResult)).toStrictEqual(TEST_REFRESH_TOKEN);
    });

    it("getCognitoId returns cognito:username claim when present", () => {
        const TEST_COGNITO_USERNAME = "user21234";
        const mockAuthenticationResult = {
            IdToken: constructFakeJwt({"cognito:username": TEST_COGNITO_USERNAME})
        };
        expect(AuthenticationResultParser.getCognitoId(mockAuthenticationResult)).toStrictEqual(TEST_COGNITO_USERNAME);
    });

    it("getCognitoId returns sub claim when cognito:username is not present", () => {
        const TEST_SUB_CLAIM = "user5678";
        const mockAuthenticationResult = {
            IdToken: constructFakeJwt({sub: TEST_SUB_CLAIM})
        };
        expect(AuthenticationResultParser.getCognitoId(mockAuthenticationResult)).toStrictEqual(TEST_SUB_CLAIM);
    });

    it("getPhoneNumber returns phone_number claim", () => {
        const TEST_PHONE_NUMBER_CLAIM = "12345678910";
        const mockAuthenticationResult = {
            IdToken: constructFakeJwt({phone_number: TEST_PHONE_NUMBER_CLAIM})
        };
        expect(AuthenticationResultParser.getPhoneNumber(mockAuthenticationResult)).toStrictEqual(TEST_PHONE_NUMBER_CLAIM);
    });

    it("getEmail returns email claim", () => {
        const TEST_EMAIL_CLAIM = "test@test.test";
        const mockAuthenticationResult = {
            IdToken: constructFakeJwt({email: TEST_EMAIL_CLAIM})
        };
        expect(AuthenticationResultParser.getEmail(mockAuthenticationResult)).toStrictEqual(TEST_EMAIL_CLAIM);
    });
});
