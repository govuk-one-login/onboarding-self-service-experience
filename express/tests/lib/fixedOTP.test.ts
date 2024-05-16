import {
    fixedOTPInitialise,
    getFixedOTPCredentialEmailAddress,
    getFixedOTPCredentialMobileNumber,
    getFixedOTPCredentialSecurityCode,
    getFixedOTPCredentialSMSCode,
    getFixedOTPCredentialTemporaryPassword,
    isFixedOTPCredential,
    isPseudonymisedFixedOTPCredential,
    respondToMFAChallengeForFixedOTPCredential,
    verifyMobileUsingOTPCode
} from "../../src/lib/fixedOTP";
import {CodeMismatchException} from "@aws-sdk/client-cognito-identity-provider";
import process from "process";

describe("Check when fixedOTP is inactive", () => {
    beforeAll(() => {
        process.env.USE_STUB_OTP = "false";
        process.env.FIXED_OTP_CREDENTIALS =
            '[{"Id": "~isValid", "EmailTemplate": "^testuser.*@unit-testing.com$", "EmailAddress": "testuser1@unit-testing.com", "EmailOTP": "123456", "EmailPassword": "testuser1Password", "Mobile": "07700900000", "SMSCode": "789012"}]';

        // fixedOTPInialise would never be called by Cognito Client if USE_STUB_OTP == false;
    });

    it("Check verifyMobileUsingOTPCode", () => {
        expect(() => verifyMobileUsingOTPCode("testuser1@unit-testing.com", "789012")).toThrow(CodeMismatchException);
        expect(() => verifyMobileUsingOTPCode("testuser1@unit-testing.com", "123456")).toThrow(CodeMismatchException);
        expect(() => verifyMobileUsingOTPCode("testuser1@unit-testing.com", "999999")).toThrow(CodeMismatchException);
    });

    it("Check respondToMFAChallengeForFixedOTPCredential", () => {
        expect(() => respondToMFAChallengeForFixedOTPCredential("testuser1@unit-testing.com", "789012")).toThrow(CodeMismatchException);
        expect(() => respondToMFAChallengeForFixedOTPCredential("testuser1@unit-testing.com", "123456")).toThrow(CodeMismatchException);
        expect(() => respondToMFAChallengeForFixedOTPCredential("testuser1@unit-testing.com", "999999")).toThrow(CodeMismatchException);
    });

    it("Check isFixedOTPCredential", () => {
        expect(isFixedOTPCredential("testuser1@unit-testing.com")).toBe(false);
        expect(isFixedOTPCredential("notestuser1@unit-testing.com")).toBe(false);
    });

    it("Check isPseudonymisedFixedOTPCredential", () => {
        expect(isPseudonymisedFixedOTPCredential("~IsValid")).toBe(false);
        expect(isPseudonymisedFixedOTPCredential("InValid")).toBe(false);
    });

    it("Check getFixedOTPCredentialEmailAddress", () => {
        expect(getFixedOTPCredentialEmailAddress("~isValid")).toEqual("");
        expect(getFixedOTPCredentialEmailAddress("isValid")).toEqual("");
    });

    it("Check getFixedOTPCredentialTemporaryPassword", () => {
        expect(getFixedOTPCredentialTemporaryPassword("~isValid")).toEqual("");
        expect(getFixedOTPCredentialTemporaryPassword("isValid")).toEqual("");
    });

    it("Check getFixedOTPCredentialSecurityCode", () => {
        expect(getFixedOTPCredentialSecurityCode("~isValid")).toEqual("");
        expect(getFixedOTPCredentialSecurityCode("isValid")).toEqual("");
    });

    it("Check getFixedOTPCredentialMobileNumber", () => {
        expect(getFixedOTPCredentialMobileNumber("~isValid")).toEqual("");
        expect(getFixedOTPCredentialMobileNumber("isValid")).toEqual("");
    });

    it("Check getFixedOTPCredentialSMSCode", () => {
        expect(getFixedOTPCredentialSMSCode("~isValid")).toEqual("");
        expect(getFixedOTPCredentialSMSCode("isValid")).toEqual("");
    });
});

describe("Check when fixedOTP is active but no Credentials", () => {
    beforeAll(() => {
        process.env.USE_STUB_OTP = "true";
        process.env.FIXED_OTP_CREDENTIALS = "";

        fixedOTPInitialise();
    });

    it("Check verifyMobileUsingOTPCode", () => {
        expect(() => verifyMobileUsingOTPCode("testuser1@unit-testing.com", "789012")).toThrow(CodeMismatchException);
        expect(() => verifyMobileUsingOTPCode("testuser1@unit-testing.com", "123456")).toThrow(CodeMismatchException);
        expect(() => verifyMobileUsingOTPCode("testuser1@unit-testing.com", "999999")).toThrow(CodeMismatchException);
    });

    it("Check respondToMFAChallengeForFixedOTPCredential", () => {
        expect(() => respondToMFAChallengeForFixedOTPCredential("testuser1@unit-testing.com", "789012")).toThrow(CodeMismatchException);
        expect(() => respondToMFAChallengeForFixedOTPCredential("testuser1@unit-testing.com", "123456")).toThrow(CodeMismatchException);
        expect(() => respondToMFAChallengeForFixedOTPCredential("testuser1@unit-testing.com", "999999")).toThrow(CodeMismatchException);
    });

    it("Check isFixedOTPCredential", () => {
        expect(isFixedOTPCredential("testuser1@unit-testing.com")).toBe(false);
        expect(isFixedOTPCredential("notestuser1@unit-testing.com")).toBe(false);
    });

    it("Check isPseudonymisedFixedOTPCredential", () => {
        expect(isPseudonymisedFixedOTPCredential("~IsValid")).toBe(false);
        expect(isPseudonymisedFixedOTPCredential("InValid")).toBe(false);
    });

    it("Check getFixedOTPCredentialEmailAddress", () => {
        expect(getFixedOTPCredentialEmailAddress("~isValid")).toEqual("");
        expect(getFixedOTPCredentialEmailAddress("isValid")).toEqual("");
    });

    it("Check getFixedOTPCredentialTemporaryPassword", () => {
        expect(getFixedOTPCredentialTemporaryPassword("~isValid")).toEqual("");
        expect(getFixedOTPCredentialTemporaryPassword("isValid")).toEqual("");
    });

    it("Check getFixedOTPCredentialSecurityCode", () => {
        expect(getFixedOTPCredentialSecurityCode("~isValid")).toEqual("");
        expect(getFixedOTPCredentialSecurityCode("isValid")).toEqual("");
    });

    it("Check getFixedOTPCredentialMobileNumber", () => {
        expect(getFixedOTPCredentialMobileNumber("~isValid")).toEqual("");
        expect(getFixedOTPCredentialMobileNumber("isValid")).toEqual("");
    });

    it("Check getFixedOTPCredentialSMSCode", () => {
        expect(getFixedOTPCredentialSMSCode("~isValid")).toEqual("");
        expect(getFixedOTPCredentialSMSCode("isValid")).toEqual("");
    });
});

describe("Check when fixedOTP is active", () => {
    beforeAll(() => {
        process.env.USE_STUB_OTP = "true";
        process.env.FIXED_OTP_CREDENTIALS =
            '[{"Id": "~isValid", "EmailTemplate": "^testuser1.*@unit-testing.com$", "EmailAddress": "testuser1@unit-testing.com", "EmailOTP": "123456", "EmailPassword": "testuser1Password", "Mobile": "07700900000", "SMSCode": "789012"}]';

        fixedOTPInitialise();
    });

    it("Check verifyMobileUsingOTPCode", () => {
        verifyMobileUsingOTPCode("testuser1@unit-testing.com", "789012");
        expect(() => verifyMobileUsingOTPCode("testuser1@unit-testing.com", "123456")).toThrow(CodeMismatchException);
        expect(() => verifyMobileUsingOTPCode("testuser1@unit-testing.com", "999999")).toThrow(CodeMismatchException);
    });

    it("Check respondToMFAChallengeForFixedOTPCredential", () => {
        respondToMFAChallengeForFixedOTPCredential("testuser1@unit-testing.com", "789012");
        expect(() => respondToMFAChallengeForFixedOTPCredential("testuser1@unit-testing.com", "123456")).toThrow(CodeMismatchException);
        expect(() => respondToMFAChallengeForFixedOTPCredential("testuser1@unit-testing.com", "999999")).toThrow(CodeMismatchException);
    });

    it("Check isFixedOTPCredential", () => {
        expect(isFixedOTPCredential("testuser1@unit-testing.com")).toBe(true);
        expect(isFixedOTPCredential("notestuser1@unit-testing.com")).toBe(false);
    });

    it("Check isPseudonymisedFixedOTPCredential", () => {
        expect(isPseudonymisedFixedOTPCredential("~IsValid")).toBe(true);
        expect(isPseudonymisedFixedOTPCredential("InValid")).toBe(false);
    });

    it("Check getFixedOTPCredentialEmailAddress", () => {
        expect(getFixedOTPCredentialEmailAddress("~isValid")).toEqual("testuser1@unit-testing.com");
        expect(getFixedOTPCredentialEmailAddress("isValid")).toEqual("");
    });

    it("Check getFixedOTPCredentialTemporaryPassword", () => {
        expect(getFixedOTPCredentialTemporaryPassword("~isValid")).toEqual("123456");
        expect(getFixedOTPCredentialTemporaryPassword("isValid")).toEqual("");
    });

    it("Check getFixedOTPCredentialSecurityCode", () => {
        expect(getFixedOTPCredentialSecurityCode("~isValid")).toEqual("123456");
        expect(getFixedOTPCredentialSecurityCode("isValid")).toEqual("");
    });

    it("Check getFixedOTPCredentialMobileNumber", () => {
        expect(getFixedOTPCredentialMobileNumber("~isValid")).toEqual("07700900000");
        expect(getFixedOTPCredentialMobileNumber("isValid")).toEqual("");
    });

    it("Check getFixedOTPCredentialSMSCode", () => {
        expect(getFixedOTPCredentialSMSCode("~isValid")).toEqual("789012");
        expect(getFixedOTPCredentialSMSCode("isValid")).toEqual("");
    });
});
