import {ValidationResult} from "../../types/validation-result";

export default function validateUris(urls: string[], urlLimit?: number ): ValidationResult {
    urls = urls.map(url => url.trim()).filter(url => url.length > 0);

    if (urls.length === 0) {
        return {isValid: false, errorMessage: "Enter your redirect URIs"};
    } else if (urlLimit && urls.length > urlLimit){
        return {isValid: false, errorMessage: urlLimit > 1 ? `Enter ${urlLimit} URIs` :  'Enter one URI'}
    }

    let validUrls: URL[];

    try {
        validUrls = urls.map(url => new URL(url));
    } catch (ignored) {
        return {isValid: false, errorMessage: "Enter your redirect URIs in the format https://example.com"};
    }

    for (const url of validUrls) {
        if (url.protocol !== "https:" && url.hostname !== "localhost") {
            return {isValid: false, errorMessage: "URIs must be https (except for localhost)"};
        }
    }

    return {isValid: true};
}
