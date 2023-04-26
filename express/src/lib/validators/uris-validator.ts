import {ValidationResult} from "../../types/validation-result";

export default function validateUris(urls: string[]): ValidationResult {
    if (urls.length === 0) {
        return {isValid: false, errorMessage: "Enter your redirect URIs"};
    }

    const invalidUris = findInvalidUrls(urls);
    if (invalidUris.length > 0) {
        if (invalidUris.length == 1) {
            return {isValid: false, errorMessage: `${invalidUris[0]} is not a valid URL`};
        } else {
            return {isValid: false, errorMessage: `The following URLs are not valid: ${invalidUris.join(" ")}`};
        }
    }

    for (const urlString of urls) {
        const url = new URL(urlString);
        if (url.protocol !== "https:" && !isValidLocalHost(url)) {
            return {isValid: false, errorMessage: "URLs must be https (except for localhost)"};
        }
    }

    return {isValid: true};
}

function findInvalidUrls(urls: string[]): string[] {
    const invalidUrls: string[] = [];

    for (const url of urls) {
        try {
            new URL(url);
        } catch (error) {
            invalidUrls.push(url);
        }
    }

    return invalidUrls;
}

function isValidLocalHost(url: URL): boolean {
    return url.hostname === "localhost" && (url.protocol === "http:" ?? url.protocol === "https:");
}
