import {validationResult} from "./validationResult";
import isRfc822Compliant from "../rfc822-validate";
import allowedEmailDomains from "../allowedEmailDomains";

export async function validateEmail(emailAddress: string): Promise<validationResult> {
    if (emailAddress === "") {
        return {isValid: false, errorMessage: "Enter your email address"};
    }

    if (!isRfc822Compliant(emailAddress)) {
        return {isValid: false, errorMessage: "Enter an email address in the correct format, like name@example.com"};
    }

    if (!(await isAllowedDomain(emailAddress))) {
        return {isValid: false, errorMessage: "Enter a government email address"};
    }

    return {isValid: true};
}

async function isAllowedDomain(emailAddress: string): Promise<boolean> {
    return (await allowedEmailDomains).filter((domain: string) => emailAddress.endsWith(`${domain}`)).length > 0;
}
