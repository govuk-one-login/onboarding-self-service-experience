import hasAllowedDomain from "./allowed-email-domains.js";
import isRfc822Compliant from "../utils/rfc822-validate.js";
import {ValidationResult} from "../../types/validation-result.js";
import {isPseudonymisedFixedOTPCredential} from "../fixedOTP.js";
import logger from "../logger.js";

export default async function validateEmail(emailAddress: string): Promise<ValidationResult> {
    logger.debug("In lib:email-validator:Validate Email()");

    if (isPseudonymisedFixedOTPCredential(emailAddress)) {
        return {isValid: true};
    }

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
