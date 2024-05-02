import {ValidationResult} from "../../types/validation-result";

export default function validateUri(uri: string, isGovUrl?: boolean, allowEmptyValue?: boolean): ValidationResult {
    uri = uri.trim();

    if (uri === "" && allowEmptyValue) {
        return {isValid: true};
    }

    if (uri === "") {
        return {isValid: false, errorMessage: "Enter a URI"};
    }

    let validUri: URL;

    try {
        validUri = new URL(uri);
    } catch (ignored) {
        return {isValid: false, errorMessage: "Enter your URIs in the format https://example.com"};
    }

    if (validUri.protocol !== "https:" && validUri.hostname !== "localhost") {
        return {isValid: false, errorMessage: "URIs must be https or http://localhost"};
    }
    if (isGovUrl && !/.+\.gov\.uk$/.test(validUri.hostname)) {
        return {isValid: false, errorMessage: "URIs must end in .gov.uk"};
    }

    return {isValid: true};
}
