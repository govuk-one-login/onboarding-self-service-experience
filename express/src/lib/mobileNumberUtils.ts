import {validationResult} from "./validators/validationResult";

const obscuredNumberRegex = /^\+\*{8}[0-9]{4}$/;
const invalidFormatMessage = "Enter a UK mobile phone number, like 07700 900000";

export function validate(number: string): validationResult {
    if (isBlank(number)) {
        return {isValid: false, errorMessage: "Enter a mobile phone number"};
    }

    const sanitisedNumber = sanitiseNumber(number);

    if (!prefixIsCorrect(sanitisedNumber)) {
        return {isValid: false, errorMessage: invalidFormatMessage};
    }

    const uniquePart = getUniquePart(sanitisedNumber);

    if (!containsOnlyDigits(uniquePart)) {
        return {isValid: false, errorMessage: "Enter a UK mobile phone number using numbers only"};
    }

    if (!containsExactlyTenDigits(uniquePart)) {
        return {isValid: false, errorMessage: invalidFormatMessage};
    }

    if (is070(uniquePart)) {
        return {isValid: false, errorMessage: invalidFormatMessage};
    }

    return {isValid: true};
}

export function convertToCountryPrefixFormat(number: string): string {
    number = sanitiseNumber(number);
    return `+44${getUniquePart(number)}`;
}

export function obscureNumber(number: string): string {
    if (obscuredNumberRegex.test(number)) {
        return "*" + number.substring("+44".length);
    }

    number = sanitiseNumber(number);
    return `*******${getUniquePart(number).substring(6)}`;
}

function getUniquePart(mobileNumber: string): string {
    if (mobileNumber.startsWith("+44")) {
        return mobileNumber.substring("+44".length);
    }

    if (mobileNumber.startsWith("07")) {
        return mobileNumber.substring("0".length);
    }

    throw `Unexpected mobile number prefix: '${mobileNumber.substring(0, 3)}'`;
}

function sanitiseNumber(number: string) {
    number = removeSpacingCharacters(number);
    return removeParentheses(number);
}

function removeSpacingCharacters(number: string) {
    return number.trim().replace(/[ \-]/g, "");
}

function removeParentheses(number: string) {
    return number.replace(/\(([^)]*)\)/g, "$1");
}

function isBlank(number: string): boolean {
    return number.trim().length == 0;
}

function prefixIsCorrect(number: string): boolean {
    return number.startsWith("+44") || number.startsWith("07");
}

function containsOnlyDigits(number: string) {
    return /^[0-9]*$/.test(number);
}

function containsExactlyTenDigits(number: string): boolean {
    return /^[0-9]{10}$/.test(number);
}

function is070(number: string) {
    // or +4470 ...
    return /^70.*$/.test(number);
}
