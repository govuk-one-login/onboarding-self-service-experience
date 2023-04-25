import {obscureNumber, convertToCountryPrefixFormat, validate} from "lib/mobileNumberUtils";

const INTERNATIONAL_PREFIX = "+44";
const UK_PREFIX = "0";
const NETWORK_CODE = "7700";
const FIRST_THREE_DIGITS = "900";
const LAST_THREE_DIGITS = "123";

const CANONICAL_FORMAT_NUMBER = `${INTERNATIONAL_PREFIX}${NETWORK_CODE}${FIRST_THREE_DIGITS}${LAST_THREE_DIGITS}`;

export const validNumbers = [
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

export const invalidNumbers = [
    "0115 496 0000",
    "0700000000",
    "+447000000000",
    "020 7946 0000",
    `${INTERNATIONAL_PREFIX}${NETWORK_CODE}${FIRST_THREE_DIGITS}`,
    `${INTERNATIONAL_PREFIX}${NETWORK_CODE}${FIRST_THREE_DIGITS}${FIRST_THREE_DIGITS}${FIRST_THREE_DIGITS}`
];

describe("Validate and format mobile phone numbers", () => {
    describe("Reject invalid numbers", () => {
        it("Reject a blank value", () => {
            expect(validate("")).toEqual({isValid: false, errorMessage: "Enter a mobile phone number"});
        });

        it("Reject a whitespace-only value", () => {
            expect(validate("   ")).toEqual({isValid: false, errorMessage: "Enter a mobile phone number"});
        });

        it("Reject a number including an illegal symbol", () => {
            expect(validate(`${INTERNATIONAL_PREFIX}${NETWORK_CODE}_${FIRST_THREE_DIGITS}_${LAST_THREE_DIGITS}`)).toEqual({
                isValid: false,
                errorMessage: "Enter a UK mobile phone number using numbers only"
            });
        });

        describe.each(invalidNumbers)("Reject incorrectly formatted numbers", number => {
            it(number, () => {
                expect(validate(number).isValid).toEqual(false);
            });
        });
    });

    describe("Accept valid numbers", () => {
        describe.each(validNumbers)("Format valid numbers", number => {
            describe("Convert numbers to the desired format", () => {
                it(number, () => {
                    expect(convertToCountryPrefixFormat(number)).toEqual(CANONICAL_FORMAT_NUMBER);
                });
            });

            describe("Obscure numbers", () => {
                it(number, () => {
                    expect(obscureNumber(number)).toEqual(`*******0123`);
                });
            });
        });

        it("Obscure a number already obscured by Cognito", () => {
            expect(obscureNumber("+********0123")).toEqual(`*******0123`);
        });
    });
});
