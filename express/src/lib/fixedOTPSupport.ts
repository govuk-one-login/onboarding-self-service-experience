import {CodeMismatchException} from "@aws-sdk/client-cognito-identity-provider";

interface fixedOTPCredential {
    Email: string;
    EmailCode: string;
    SMSCode: string;
    Telephone: string;
}

let fixedOTPCredentials: fixedOTPCredential[] = [];

function getFixedOTPCredential(emailAddress: string): number {
    for (let i = 0; i < fixedOTPCredentials.length; i++) {
        console.log("RegEx => " + fixedOTPCredentials[i].Email);
        const regEx = new RegExp(fixedOTPCredentials[i].Email, "i"); // The "i" flag makes the regex case-insensitive

        if (regEx.test(emailAddress)) {
            console.log("getFixedOTPCredential - Matched Email Address =>" + emailAddress);
            return i;
        }
    }

    return -1;
}

export function fixedOTPInitialise(): void {
    console.log("in fixedOTPSupport - fixedOTPInitialise");

    const fixedOTPCredentialsSecret = process.env.FIXED_OTP_CREDENTIALS;
    console.log(JSON.stringify(fixedOTPCredentialsSecret));
    fixedOTPCredentials = JSON.parse(fixedOTPCredentialsSecret as string);
}

export function isFixedCredential(emailAddress: string): boolean {
    console.log("in fixedOTPSupport - isFixedCredential");

    if (process.env.USE_STUB_OTP == "true") {
        console.log("fixedOTPInitialise - USE_STUB_OTP is Set");

        if (getFixedOTPCredential(emailAddress) > -1) {
            console.log("isFixedCredential - Matched Email Address =>" + emailAddress);
            return true;
        }

        console.log("isFixedCredential - Email Address Not Matched =>" + emailAddress);
    }

    return false;
}

export function verifyMobileUsingOTPCode(emailAddress: string, smsCode: string): void {
    console.log("in fixedOTPSupport - verifyMobileUsingOTPCode");

    const index = getFixedOTPCredential(emailAddress);

    if (index > -1) {
        if (fixedOTPCredentials[index].SMSCode === smsCode) {
            console.log("verifyMobileUsingOTPCode - Matched SMS Code =>" + smsCode);
            return;
        }
    }

    throw new CodeMismatchException({message: "", $metadata: {}});
}

export function getFixedOTPTemporaryPassword(emailAddress: string): string {
    console.log("in fixedOTPSupport - getFixedOTPTemporaryPassword");

    let temporaryPassword = "";
    const index = getFixedOTPCredential(emailAddress);

    if (index > -1) {
        temporaryPassword = fixedOTPCredentials[index].EmailCode;
        console.log("getFixedOTPTemporaryPassword - Matched Code:" + temporaryPassword + " for => " + emailAddress);
    }

    return temporaryPassword;
}

export function getFixedOTPTelephone(emailAddress: string): string {
    console.log("in fixedOTPSupport - getFixedOTPTelephone");

    let telephoneNumber = "";
    const index = getFixedOTPCredential(emailAddress);

    if (index > -1) {
        telephoneNumber = fixedOTPCredentials[index].Telephone;
        console.log("getFixedOTPTelephone - Telephone:" + telephoneNumber + " for => " + emailAddress);
    }

    return telephoneNumber;
}
