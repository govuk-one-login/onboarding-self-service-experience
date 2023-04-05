import {obscureNumber, convertToCountryPrefixFormat, validate} from "lib/mobileNumberUtils";

export const INTERNATIONAL_PREFIX = "+44";
export const UK_PREFIX = "0";
export const NETWORK_CODE = "7700";
export const FIRST_THREE_DIGITS = "900";
export const LAST_THREE_DIGITS = "123";

export const VALID_NUMBERS = [
    `${INTERNATIONAL_PREFIX}${NETWORK_CODE}${FIRST_THREE_DIGITS}${LAST_THREE_DIGITS}`,
    `${INTERNATIONAL_PREFIX}${NETWORK_CODE} ${FIRST_THREE_DIGITS} ${LAST_THREE_DIGITS}`,
    `${INTERNATIONAL_PREFIX}${NETWORK_CODE}-${FIRST_THREE_DIGITS}-${LAST_THREE_DIGITS}`,
    `${UK_PREFIX}${NETWORK_CODE}${FIRST_THREE_DIGITS}${LAST_THREE_DIGITS}`,
    `${UK_PREFIX}${NETWORK_CODE} ${FIRST_THREE_DIGITS} ${LAST_THREE_DIGITS}`,
    `${UK_PREFIX}${NETWORK_CODE}-${FIRST_THREE_DIGITS}-${LAST_THREE_DIGITS}`,
    `(${UK_PREFIX}${NETWORK_CODE})${FIRST_THREE_DIGITS}${LAST_THREE_DIGITS}`,
    `(${UK_PREFIX}${NETWORK_CODE}) ${FIRST_THREE_DIGITS} ${LAST_THREE_DIGITS}`,
    `(${UK_PREFIX}${NETWORK_CODE}) ${FIRST_THREE_DIGITS}-${LAST_THREE_DIGITS}`
];

export const INVALID_NUMBERS = [
    "0115 496 0000",
    "0700000000",
    "+447000000000",
    "020 7946 0000",
    `${INTERNATIONAL_PREFIX}${NETWORK_CODE}${FIRST_THREE_DIGITS}`,
    `${INTERNATIONAL_PREFIX}${NETWORK_CODE}${FIRST_THREE_DIGITS}${FIRST_THREE_DIGITS}${FIRST_THREE_DIGITS}`
];

describe("check that valid numbers are correctly formatted", () => {
    it.each(VALID_NUMBERS)("returns a correctly formatted number for %s", validNumber => {
        expect(convertToCountryPrefixFormat(validNumber)).toBe(
            `${INTERNATIONAL_PREFIX}${NETWORK_CODE}${FIRST_THREE_DIGITS}${LAST_THREE_DIGITS}`
        );
    });
});

describe("check that blank values are rejected", () => {
    it("returns an error validation result if a blank value is given", () => {
        expect(validate("")).toEqual({isValid: false, errorMessage: "Enter a mobile phone number"});
    });

    it("returns an error validation result if a whitespace-only value is given", () => {
        expect(validate("   ")).toEqual({isValid: false, errorMessage: "Enter a mobile phone number"});
    });
});

describe("check that valid numbers are correctly obscured", () => {
    it.each(VALID_NUMBERS)("returns a correctly obscured number for %s", validNumber => {
        expect(obscureNumber(validNumber)).toEqual(`*******0123`);
    });

    it("returns a correctly obscured number when the number has already been obscured by Cognito", () => {
        expect(obscureNumber("+********0123")).toEqual(`*******0123`);
    });
});

describe("check that invalid numbers are rejected", () => {
    it.each(INVALID_NUMBERS)("returns an error validation result for %s", invalidNumber => {
        expect(validate(invalidNumber).isValid).toEqual(false);
    });
});

it("returns and error validation result if a bad symbol is included in the number", () => {
    expect(validate(`${INTERNATIONAL_PREFIX}${NETWORK_CODE}_${FIRST_THREE_DIGITS}_${LAST_THREE_DIGITS}`)).toEqual({
        isValid: false,
        errorMessage: "Enter a UK mobile phone number using numbers only"
    });
});
