import {validationResult} from "./validationResult";

export function validateSecurityCode(securityCode: string): validationResult {
    if (isEmpty(securityCode)) {
        return {isValid: false, errorMessage: "Enter the 6 digit security code"};
    }

    if (notSixCharacters(securityCode)) {
        return {isValid: false, errorMessage: "Enter the security code using only 6 digits"};
    }

    if (notJustDigits(securityCode)) {
        return {isValid: false, errorMessage: "Your security code should only include numbers"};
    }

    return {isValid: true};
}

function isEmpty(securityCode: string): boolean {
    return securityCode === "";
}

function notSixCharacters(securityCode: string): boolean {
    return !/^.{6}$/.test(securityCode);
}

function notJustDigits(securityCode: string): boolean {
    return !/^[0-9]{6}$/.test(securityCode);
}
