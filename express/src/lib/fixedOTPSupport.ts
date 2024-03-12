import {CodeMismatchException} from "@aws-sdk/client-cognito-identity-provider";

interface fixedOTPCredential {
    Email: string;
    EmailCode: string;
    SMSCode: string;
    Telephone: string;
}

let fixedOTPCredentials: fixedOTPCredential[] = [];

function verifyMFACode(emailAddress: string, securityCode: string) {
    const index = getFixedOTPCredential(emailAddress);

    if (index > -1) {
        if (fixedOTPCredentials[index].SMSCode === securityCode) {
            return;
        }
    }

    throw new CodeMismatchException({message: "", $metadata: {}});
}

function getFixedOTPCredential(emailAddress: string): number {
    for (let i = 0; i < fixedOTPCredentials.length; i++) {
        const regEx = new RegExp(fixedOTPCredentials[i].Email, "i"); // The "i" flag makes the regex case-insensitive

        if (regEx.test(emailAddress)) {
            return i;
        }
    }

    return -1;
}

export function fixedOTPInitialise(): void {
    console.log("in fixedOTPSupport - fixedOTPInitialise");

    const fixedOTPCredentialsSecret = process.env.FIXED_OTP_CREDENTIALS;
    fixedOTPCredentials = JSON.parse(fixedOTPCredentialsSecret as string);
}

export function isFixedCredential(emailAddress: string): boolean {
    console.log("in fixedOTPSupport - isFixedCredential");

    if (process.env.USE_STUB_OTP == "true") {
        if (getFixedOTPCredential(emailAddress) > -1) {
            return true;
        }
    }

    return false;
}

export function verifyMobileUsingOTPCode(emailAddress: string, smsCode: string): void {
    console.log("in fixedOTPSupport - verifyMobileUsingOTPCode");
    verifyMFACode(emailAddress, smsCode);
}

export function getFixedOTPTemporaryPassword(emailAddress: string): string {
    console.log("in fixedOTPSupport - getFixedOTPTemporaryPassword");

    let temporaryPassword = "";
    const index = getFixedOTPCredential(emailAddress);

    if (index > -1) {
        temporaryPassword = fixedOTPCredentials[index].EmailCode;
    }

    return temporaryPassword;
}

export function getFixedOTPTelephone(emailAddress: string): string {
    console.log("in fixedOTPSupport - getFixedOTPTelephone");

    let telephoneNumber = "";
    const index = getFixedOTPCredential(emailAddress);

    if (index > -1) {
        telephoneNumber = fixedOTPCredentials[index].Telephone;
    }

    return telephoneNumber;
}

export function respondToMFAChallengeForFixedOTPCredential(email: string, securityCode: string): void {
    verifyMFACode(email, securityCode);
}
