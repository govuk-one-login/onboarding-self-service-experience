import {validationResult} from "./validationResult";

export default function validatePassword(password: string): validationResult {
    if (password.length === 0) {
        return {isValid: false, errorMessage: "Enter a password"};
    }

    if (password.length < 8) {
        return {isValid: false, errorMessage: "Your password must be 8 characters or more"};
    }

    return {isValid: true};
}
