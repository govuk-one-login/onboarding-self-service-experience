import hasAllowedDomain from "./allowed-email-domains";
import isRfc822Compliant from "../utils/rfc822-validate";
import {ValidationResult} from "../../types/validation-result";

export default async function validateEmail(emailAddress: string): Promise<ValidationResult> {
    if (!emailAddress) {
        return {isValid: false, errorMessage: "Enter your email address"};
    }

    if (!isRfc822Compliant(emailAddress)) {
        return {isValid: false, errorMessage: "Enter an email address in the correct format, like name@example.com"};
    }

    const isAllowed = await hasAllowedDomain(emailAddress);

    if (!isAllowed) {
        return {isValid: false, errorMessage: "Enter a government email address"};
    }

    return {isValid: true};
}
