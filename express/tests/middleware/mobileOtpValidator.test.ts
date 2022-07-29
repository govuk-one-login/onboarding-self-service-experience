import { assert } from "chai";
import { sixDigits } from "../../src/middleware/mobileOtpValidator";

const OTP_WITH_EMPTY_VALUE = '';
const OTP_LESS_THAN_6_DIGITS = '123';
const VALID_OTP_6_DIGITS = '123456';
const OTP_7_DIGITS = '1234567';
const OTP_ALPHA = 'test12';
const OTP_SPECIAL = '123$%^';

describe('Checking that the user has entered a valid OTP', () => {
    it('a valid "123456" 6 digit OTP is accepted. ', async function () {
        assert.equal(sixDigits(VALID_OTP_6_DIGITS), true, `Expected ${VALID_OTP_6_DIGITS} to be allowed because it has exactly 6 Digits`);
    });
    it('an OTP with more than 6 digits is not accepted. ', async function () {
        assert.equal(sixDigits(OTP_7_DIGITS), false, `Expected ${OTP_7_DIGITS} not to be allowed because it has more than 6 digits`);
    });
    it('an OTP with less than 6 digits is not accepted. ', async function () {
        assert.equal(sixDigits(OTP_LESS_THAN_6_DIGITS), false, `Expected ${OTP_LESS_THAN_6_DIGITS} not to be allowed because it does not have 6 digits`);
    });
    it('a password with empty value is not accepted. ', async function () {
        assert.equal(sixDigits(OTP_WITH_EMPTY_VALUE), false, `Expected ${OTP_WITH_EMPTY_VALUE} not to be allowed because it has empty value`);
    });
    it('an OTP containing alpha characters  is not accepted. ', async function () {
        assert.equal(sixDigits(OTP_ALPHA), false, `Expected ${OTP_ALPHA} not to be allowed because it has alpha characters `);
    });
    it('an OTP containing special characters  is not accepted. ', async function () {
        assert.equal(sixDigits(OTP_SPECIAL), false, `Expected ${OTP_SPECIAL} not to be allowed because it has special characters `);
    });
});
