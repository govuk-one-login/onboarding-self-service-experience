import {validateSecurityCode} from "lib/validators/checkOtp";

const OTP_WITH_EMPTY_VALUE = "";
const OTP_LESS_THAN_6_DIGITS = "123";
const VALID_OTP_6_DIGITS = "123456";
const OTP_7_DIGITS = "1234567";
const OTP_ALPHA = "test12";
const OTP_SPECIAL = "123$%^";

describe("Checking that the user has entered a valid security code", () => {
    it("a valid '123456' 6 digit security code is accepted", () => {
        expect(validateSecurityCode(VALID_OTP_6_DIGITS)).toEqual({isValid: true});
    });

    it("a security code with more than 6 digits is not accepted", () => {
        expect(validateSecurityCode(OTP_7_DIGITS)).toEqual({isValid: false, errorMessage: "Enter the security code using only 6 digits"});
    });

    it("a security code with less than 6 digits is not accepted", () => {
        expect(validateSecurityCode(OTP_LESS_THAN_6_DIGITS)).toEqual({
            isValid: false,
            errorMessage: "Enter the security code using only 6 digits"
        });
    });

    it("a password with empty value is not accepted", () => {
        expect(validateSecurityCode(OTP_WITH_EMPTY_VALUE)).toEqual({isValid: false, errorMessage: "Enter the 6 digit security code"});
    });

    it("a security code containing alpha characters  is not accepted", () => {
        expect(validateSecurityCode(OTP_ALPHA)).toEqual({
            isValid: false,
            errorMessage: "Your security code should only include numbers"
        });
    });

    it("a security code containing special characters is not accepted", () => {
        expect(validateSecurityCode(OTP_SPECIAL)).toEqual({
            isValid: false,
            errorMessage: "Your security code should only include numbers"
        });
    });
});
