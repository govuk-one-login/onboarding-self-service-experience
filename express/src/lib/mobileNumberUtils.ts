export function validate(number: string): {isValid: boolean; errorMessage?: string} {
    let processed: string;

    if (isBlank(number)) {
        return {isValid: false, errorMessage: "Enter a mobile phone number"};
    }

    processed = removeParentheses(number);

    if (!prefixIsCorrect(processed)) {
        return {isValid: false, errorMessage: "Enter a UK mobile phone number, like 07700 900000"};
    }

    processed = getUniquePart(processed);
    processed = removeSpacingCharacters(processed);

    if (!onlyNumbersOrPlusRemain(processed)) {
        return {isValid: false, errorMessage: "Enter a UK mobile phone number using numbers only"};
    }

    if (!exactlyTenNumbersRemain(processed)) {
        return {isValid: false, errorMessage: "Enter a UK mobile phone number, like 07700 900000"};
    }

    return {isValid: true};
}

export function prepareForCognito(number: string): string {
    let processed = removeParentheses(number);
    processed = getUniquePart(processed);
    return `+44${removeSpacingCharacters(processed)}`;
}

function isBlank(number: string): boolean {
    return !number;
}

function prefixIsCorrect(number: string): boolean {
    return number.trim().startsWith("+44") || number.trim().startsWith("07");
}

function getUniquePart(mobileNumber: string): string {
    if (mobileNumber.trim().startsWith("+44")) {
        return mobileNumber.trim().substring("+44".length);
    }

    if (mobileNumber.trim().startsWith("07")) {
        return mobileNumber.trim().substring("0".length);
    }

    return mobileNumber.trim();
}

function removeParentheses(number: string) {
    return number.trim().replace(/^\((.*)\)(.*)$/g, "$1$2");
}

function onlyNumbersOrPlusRemain(number: string) {
    console.log(number.trim() + ` :${/^[\+0-9]*$/.test(number.trim())}`);
    return /^[\+0-9]*$/.test(number.trim());
}

function removeSpacingCharacters(number: string) {
    return number.replace(/\ |\-/g, "");
}

function exactlyTenNumbersRemain(number: string): boolean {
    return /^[0-9]{10}$/.test(number.trim());
}
