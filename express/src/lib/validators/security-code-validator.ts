import {ValidationResult} from "../../types/validation-result";

export default function validateSecurityCode(securityCode: string): ValidationResult {
    if (!securityCode) {
        return {isValid: false, errorMessage: "Enter the 6 digit security code"};
    }

    if (securityCode.length != 6) {
        return {isValid: false, errorMessage: "Enter the security code using only 6 digits"};
    }

    if (!hasOnlyDigits(securityCode)) {
        return {isValid: false, errorMessage: "Your security code should only include numbers"};
    }

    return {isValid: true};
}

function hasOnlyDigits(securityCode: string): boolean {
    return !/\D/.test(securityCode);
}
