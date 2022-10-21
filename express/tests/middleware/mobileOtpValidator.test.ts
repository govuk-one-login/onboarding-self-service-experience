import {sixDigits} from "../../src/middleware/mobileOtpValidator";

const OTP_WITH_EMPTY_VALUE = "";
const OTP_LESS_THAN_6_DIGITS = "123";
const VALID_OTP_6_DIGITS = "123456";
const OTP_7_DIGITS = "1234567";
const OTP_ALPHA = "test12";
const OTP_SPECIAL = "123$%^";

describe("Checking that the user has entered a valid OTP", () => {
    it("a valid 6 digit OTP is accepted", () => {
        expect(sixDigits(VALID_OTP_6_DIGITS)).toBe(true);
    });

    it("an OTP with more than 6 digits is not accepted", () => {
        expect(sixDigits(OTP_7_DIGITS)).toBe(false);
    });

    it("an OTP with less than 6 digits is not accepted", () => {
        expect(sixDigits(OTP_LESS_THAN_6_DIGITS)).toBe(false);
    });

    it("an OTP with empty value is not accepted", () => {
        expect(sixDigits(OTP_WITH_EMPTY_VALUE)).toBe(false);
    });

    it("an OTP containing alpha characters  is not accepted", () => {
        expect(sixDigits(OTP_ALPHA)).toBe(false);
    });

    it("an OTP containing special characters  is not accepted", () => {
        expect(sixDigits(OTP_SPECIAL)).toBe(false);
    });
});
