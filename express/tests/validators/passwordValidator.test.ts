import {validatePassword} from "../../src/lib/validators/passwordValidator";

const PASSWORD_WITH_EMPTY_VALUE = "";
const PASSWORD_LESS_THAN_8_CHAR = "123";
const PASSWORD_8_CHAR = "12345678";
const PASSWORD_9_CHAR = "123456789";
const PASSWORD_WITH_LEADING_AND_TRAILING_SPACES = " 123456 ";

describe("Checking that the user has entered a valid password", () => {
    it(`accepts an 8 character password like "${PASSWORD_8_CHAR}".`, async function () {
        expect(validatePassword(PASSWORD_8_CHAR)).toEqual({isValid: true});
    });

    it(`accepts a password with more than 8 characters like "${PASSWORD_9_CHAR}".`, async function () {
        expect(validatePassword(PASSWORD_9_CHAR)).toEqual({isValid: true});
    });

    it(`accepts a valid password with leading or trailing spaces like "${PASSWORD_WITH_LEADING_AND_TRAILING_SPACES}".`, async function () {
        expect(validatePassword(PASSWORD_9_CHAR)).toEqual({isValid: true});
    });

    it(`does not accept a password with less than 8 characters like "${PASSWORD_LESS_THAN_8_CHAR}". `, async function () {
        expect(validatePassword(PASSWORD_LESS_THAN_8_CHAR)).toEqual({
            isValid: false,
            errorMessage: "Your password must be 8 characters or more"
        });
    });

    it("does not accept a password with empty value.", async function () {
        expect(validatePassword(PASSWORD_WITH_EMPTY_VALUE)).toEqual({isValid: false, errorMessage: "Enter a password"});
    });
});
