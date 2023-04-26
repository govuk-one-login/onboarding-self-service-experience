import {ValidationResult} from "../../types/validation-result";

export default function validatePassword(password: string): ValidationResult {
    if (password.length === 0) {
        return {isValid: false, errorMessage: "Enter a password"};
    }

    if (password.length < 8) {
        return {isValid: false, errorMessage: "Your password must be 8 characters or more"};
    }

    return {isValid: true};
}
