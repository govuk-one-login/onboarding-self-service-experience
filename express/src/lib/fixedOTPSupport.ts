import {CodeMismatchException} from "@aws-sdk/client-cognito-identity-provider";

interface fixedOTPCredential {
    Email: string;
    EmailCode: string;
    SMSCode: string;
}

let fixedOTPCredentials: fixedOTPCredential[] = [];

function getFixedOTPCredential(emailAddress: string): number {
    for (let i = 0; i < fixedOTPCredentials.length; i++) {
        if (fixedOTPCredentials[i].Email === emailAddress) {
            console.log("verifyMobileUsingOTPCode - Found Email Address =>" + emailAddress);
            return i;
        }
    }

    return -1;
}

export function fixedOTPInitialise(): void {
    console.log("in fixedOTPSupport - fixedOTPInitialise");

    if (process.env.USE_STUB_OTP == "true") {
        console.log("fixedOTPInitialise - USE_STUB_OTP is Set");

        const fixedOTPCredentialsSecret = process.env.FIXED_OTP_CREDENTIALS;
        fixedOTPCredentials = JSON.parse(fixedOTPCredentialsSecret as string);
    }
}

export function isFixedCredential(emailAddress: string): boolean {
    console.log("in fixedOTPSupport - isFixedCredential");

    if (process.env.USE_STUB_OTP == "true") {
        console.log("fixedOTPInitialise - USE_STUB_OTP is Set");

        if (getFixedOTPCredential(emailAddress) > -1) {
            console.log("isFixedCredential - Found Email Address =>" + emailAddress);
            return true;
        }

        console.log("isFixedCredential - Email Address Not Found =>" + emailAddress);
    }

    return false;
}

export function verifyMobileUsingOTPCode(emailAddress: string, smsCode: string): void {
    console.log("in fixedOTPSupport - verifyMobileUsingOTPCode");

    const index = getFixedOTPCredential(emailAddress);

    if (index > -1) {
        if (fixedOTPCredentials[index].Email === emailAddress) {
            if (fixedOTPCredentials[index].SMSCode === smsCode) {
                console.log("verifyMobileUsingOTPCode - Found SMS Code =>" + smsCode);
                return;
            }
        }
    }

    throw new CodeMismatchException({message: "", $metadata: {}});
}

export function getFixedOTPTemporaryPassword(emailAddress: string): string {
    console.log("in fixedOTPSupport - getFixedOTPTemporaryPassword");

    let temporaryPassword = "";

    for (let i = 0; i < fixedOTPCredentials.length; i++) {
        if (fixedOTPCredentials[i].Email === emailAddress) {
            temporaryPassword = fixedOTPCredentials[i].EmailCode;
            console.log("getFixedOTPTemporaryPassword - found Code:" + temporaryPassword + " for => " + emailAddress);
            break;
        }
    }

    return temporaryPassword;
}
