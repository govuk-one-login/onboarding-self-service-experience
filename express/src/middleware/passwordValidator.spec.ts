import {assert} from "chai";
import {eightDigitsMinimum} from "./passwordValidator";

const PASSWORD_WITH_EMPTY_VALUE = '';
const PASSWORD_LESS_THAN_8_CHAR = '123';
const PASSWORD_8_CHAR_MINIMUM = '12345678';

describe('Checking that the user has entered a valid password', () => {
    it('a valid +4479 number is accepted. ', async function () {
        assert.equal(eightDigitsMinimum(PASSWORD_8_CHAR_MINIMUM), true, `Expected ${PASSWORD_8_CHAR_MINIMUM} to be allowed because it has 8 or more characters`);
    });
    it('a valid +4479 number is accepted. ', async function () {
        assert.equal(eightDigitsMinimum(PASSWORD_LESS_THAN_8_CHAR), false, `Expected ${PASSWORD_LESS_THAN_8_CHAR} not to be allowed because it does not have 8 or more characters`);
    });
    it('a valid +4479 number is accepted. ', async function () {
        assert.equal(eightDigitsMinimum(PASSWORD_WITH_EMPTY_VALUE), false, `Expected ${PASSWORD_WITH_EMPTY_VALUE} not to be allowed because it has empty value`);
    });
});

