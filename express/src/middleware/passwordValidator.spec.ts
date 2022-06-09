import {assert} from "chai";
import {eightDigitsMinimum} from "./passwordValidator";

const PASSWORD_WITH_EMPTY_VALUE = '';
const PASSWORD_LESS_THAN_8_CHAR = '123';
const PASSWORD_8_CHAR = '12345678';
const PASSWORD_9_CHAR = '123456789';

describe('Checking that the user has entered a valid password', () => {
    it('a valid "12345678" 8 character password is accepted. ', async function () {
        assert.equal(eightDigitsMinimum(PASSWORD_8_CHAR), true, `Expected ${PASSWORD_8_CHAR} to be allowed because it has 8 or more characters`);
    });
    it('a valid "123456789" more than 8 character password is accepted. ', async function () {
        assert.equal(eightDigitsMinimum(PASSWORD_9_CHAR), true, `Expected ${PASSWORD_9_CHAR} to be allowed because it has 8 or more characters`);
    });
    it('a password with less than 8 characters is not accepted. ', async function () {
        assert.equal(eightDigitsMinimum(PASSWORD_LESS_THAN_8_CHAR), false, `Expected ${PASSWORD_LESS_THAN_8_CHAR} not to be allowed because it does not have 8 or more characters`);
    });
    it('a password with empty value is not accepted. ', async function () {
        assert.equal(eightDigitsMinimum(PASSWORD_WITH_EMPTY_VALUE), false, `Expected ${PASSWORD_WITH_EMPTY_VALUE} not to be allowed because it has empty value`);
    });
});

