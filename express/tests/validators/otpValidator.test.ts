import {validateOtp} from "../../src/lib/validators/checkOtp";

const OTP_WITH_EMPTY_VALUE = "";
const OTP_LESS_THAN_6_DIGITS = "123";
const VALID_OTP_6_DIGITS = "123456";
const OTP_7_DIGITS = "1234567";
const OTP_ALPHA = "test12";
const OTP_SPECIAL = "123$%^";

describe("Checking that the user has entered a valid OTP", () => {
    it('a valid "123456" 6 digit OTP is accepted.', async function () {
        expect(validateOtp(VALID_OTP_6_DIGITS)).toEqual({isValid: true});
    });

    it("an OTP with more than 6 digits is not accepted.", async function () {
        expect(validateOtp(OTP_7_DIGITS)).toEqual({isValid: false, errorMessage: "Enter the security code using only 6 digits"});
    });

    it("an OTP with less than 6 digits is not accepted.", async function () {
        expect(validateOtp(OTP_LESS_THAN_6_DIGITS)).toEqual({isValid: false, errorMessage: "Enter the security code using only 6 digits"});
    });

    it("a password with empty value is not accepted.", async function () {
        expect(validateOtp(OTP_WITH_EMPTY_VALUE)).toEqual({isValid: false, errorMessage: "Enter the 6 digit security code"});
    });

    it("an OTP containing alpha characters  is not accepted.", async function () {
        expect(validateOtp(OTP_ALPHA)).toEqual({
            isValid: false,
            errorMessage: "Your security code should only include numbers"
        });
    });

    it("an OTP containing special characters  is not accepted.", async function () {
        expect(validateOtp(OTP_SPECIAL)).toEqual({
            isValid: false,
            errorMessage: "Your security code should only include numbers"
        });
    });
});
