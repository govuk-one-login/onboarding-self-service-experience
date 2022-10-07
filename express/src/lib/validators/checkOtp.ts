import {validationResult} from "./validationResult";

export function validateOtp(otp: string): validationResult {
    if (isEmpty(otp)) {
        return {isValid: false, errorMessage: "Enter the 6 digit security code"};
    }

    if (notSixCharacters(otp)) {
        return {isValid: false, errorMessage: "Enter the security code using only 6 digits"};
    }

    if (notJustDigits(otp)) {
        return {isValid: false, errorMessage: "Your security code should only include numbers"};
    }
    return {isValid: true};
}

function isEmpty(otp: string): boolean {
    return otp === "";
}

function notSixCharacters(otp: string): boolean {
    return !/^.{6}$/.test(otp);
}

function notJustDigits(otp: string): boolean {
    return !/^[0-9]{6}$/.test(otp);
}
