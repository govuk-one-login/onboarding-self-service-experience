import {CodeMismatchException} from "@aws-sdk/client-cognito-identity-provider";

interface fixedOTPCredential {
    Id: string;
    EmailTemplate: string;
    EmailAddress: string;
    EmailOTP: string;
    EmailPassword: string;
    Mobile: string;
    SMSCode: string;
}

const pseudonymisedIndicator = "~";
const expiredSecurityCode = "666666";
const expiredSMSCode = "999999";

let fixedOTPCredentials: fixedOTPCredential[] = [];
let useFixedOTP = false;

function getAttribute(attributeName: string, target: string) {
    let attributeValue = "";

    if (useFixedOTP) {
        const index = getFixedOTPCredential(target);

        if (index > -1) {
            switch (attributeName) {
                case "ADDRESS": {
                    attributeValue = fixedOTPCredentials[index].EmailAddress;
                    break;
                }
                case "PASSWORD": {
                    attributeValue = fixedOTPCredentials[index].EmailPassword;
                    break;
                }
                case "OTP": {
                    attributeValue = fixedOTPCredentials[index].EmailOTP;
                    break;
                }
                case "MOBILE": {
                    attributeValue = fixedOTPCredentials[index].Mobile;
                    break;
                }
                case "SMS": {
                    attributeValue = fixedOTPCredentials[index].SMSCode;
                    break;
                }
                default: {
                    attributeValue = "Attribute Not Found";
                    break;
                }
            }
        }
    }

    return attributeValue;
}

function getFixedOTPCredential(emailAddress: string): number {
    if (useFixedOTP) {
        for (let i = 0; i < fixedOTPCredentials.length; i++) {
            const regEx = new RegExp(fixedOTPCredentials[i].EmailTemplate, "i"); // The "i" flag makes the regex case-insensitive

            if (emailAddress === fixedOTPCredentials[i].Id || regEx.test(emailAddress)) {
                return i;
            }
        }
    }

    return -1;
}

function verifyMFACode(emailAddress: string, securityCode: string, expiredCode: string) {
    const index = getFixedOTPCredential(emailAddress);

    if (index > -1) {
        if (securityCode != expiredCode) {
            if (isPseudonymisedFixedOTPCredential(securityCode)) {
                securityCode = getFixedOTPCredentialSMSCode(securityCode);
            }

            if (fixedOTPCredentials[index].SMSCode === securityCode) {
                return;
            }
        }
    }

    throw new CodeMismatchException({message: "", $metadata: {}});
}

export function fixedOTPInitialise(): void {
    console.log("in fixedOTP - fixedOTPInitialise");

    const fixedOTPCredentialsSecret = process.env.FIXED_OTP_CREDENTIALS as string;

    if (fixedOTPCredentialsSecret != null) {
        if (fixedOTPCredentialsSecret.trim() != "") {
            fixedOTPCredentials = JSON.parse(fixedOTPCredentialsSecret as string);
            useFixedOTP = true;
        }
    }
}

export function verifyMobileUsingOTPCode(emailAddress: string, smsCode: string): void {
    console.log("in fixedOTP - verifyMobileUsingOTPCode");
    verifyMFACode(emailAddress, smsCode, expiredSMSCode);
}

export function respondToMFAChallengeForFixedOTPCredential(email: string, securityCode: string): void {
    verifyMFACode(email, securityCode, expiredSecurityCode);
}

export function isFixedOTPCredential(credential: string): boolean {
    console.log("in fixedOTP - isFixedOTPCredential");

    let index = -1;

    if (useFixedOTP) {
        index = getFixedOTPCredential(credential);
    }

    return index > -1;
}

export function isPseudonymisedFixedOTPCredential(credential: string): boolean {
    if (useFixedOTP) {
        return credential.startsWith(pseudonymisedIndicator);
    } else {
        return false;
    }
}

export function getFixedOTPCredentialEmailAddress(emailAddress: string): string {
    console.log("in fixedOTP - getFixedOTPCredentialEmailAddress");
    return getAttribute("ADDRESS", emailAddress);
}

export function getFixedOTPCredentialTemporaryPassword(emailAddress: string): string {
    console.log("in fixedOTP - getFixedOTPCredentialTemporaryPassword");
    return getAttribute("OTP", emailAddress);
}

export function getFixedOTPCredentialSecurityCode(emailAddress: string): string {
    console.log("in fixedOTP - getFixedOTPCredentialSecurityCode");
    return getAttribute("OTP", emailAddress);
}

export function getFixedOTPCredentialPassword(emailAddress: string): string {
    console.log("in fixedOTP - getFixedOTPCredentialPassword");
    return getAttribute("PASSWORD", emailAddress);
}

export function getFixedOTPCredentialMobileNumber(target: string): string {
    console.log("in fixedOTP - getFixedOTPCredentialMobileNumber");
    return getAttribute("MOBILE", target);
}

export function getFixedOTPCredentialSMSCode(emailAddress: string): string {
    console.log("in fixedOTP - getFixedOTPCredentialSMSCode");
    return getAttribute("SMS", emailAddress);
}
