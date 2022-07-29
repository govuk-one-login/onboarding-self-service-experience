import { assert } from "chai";
import {
    beginsWith070,
    convert07Numbers,
    lengthCheck,
    onlyNumbers,
    removeSpaceAndDash,
    ukNumberCheck
} from "../../src/middleware/mobileValidator"

const NUMBER_WITH_BAD_CHARACTERS = 'O7958123456'; // Capital letter O not 0
const NUMBER_BEGINNING_WITH_070 = '07058123456';
const NUMBER_BEGINNING_WITH_PLUS_4470 = '+447058123456';
const NUMBER_BEGINNING_WITH_08 = '08958123456';

const VALID_NUMBER_STARTING_WITH_0 = '07958123456';

const VALID_NUMBER_STARTING_WITH_0_CONTAINING_SPACES = '07958 123 456';
const VALID_NUMBER_STARTING_WITH_0_CONTAINING_DASHES = '07958-123-456';

const VALID_NUMBER_STARTING_WITH_PLUS_44 = '+447958123456';
const VALID_NUMBER_STARTING_WITH_PLUS_44_CONTAINING_SPACES = '+447958 123 456';
const VALID_NUMBER_STARTING_WITH_PLUS_44_CONTAINING_DASHES = '+447958-123-456';

const INVALID_NUMBER_STARTING_WITH_PLUS_44 = '+448959123456';
const INVALID_NUMBER_STARTING_WITH_PLUS_48 = '+488959123456';

const VALID_NUMBER_STARTING_WITH_PLUS_44_WITH_OVER_10_DIGITS = '+44795812345600'; // Digit count after +44 is 12
const VALID_NUMBER_STARTING_WITH_PLUS_44_WITH_LESS_THAN_10_DIGITS = '+44795812'; // Digit count after +44 is 6

describe('Checking that the submitted mobile number only contains numbers', () => {

    it('a valid 079 number is accepted. ', async function () {
        assert.equal(onlyNumbers(VALID_NUMBER_STARTING_WITH_0), true, `Expected ${VALID_NUMBER_STARTING_WITH_0} to be allowed because it only contains numbers`);
    });

    it('a valid +4479 number is accepted. ', async function () {
        assert.equal(onlyNumbers(VALID_NUMBER_STARTING_WITH_PLUS_44), true, `Expected ${VALID_NUMBER_STARTING_WITH_PLUS_44} to be allowed because it only contains numbers and the plus symbol`);
    });

    it('a number which contains a letter is not accepted. ', async function () {
        assert.equal(onlyNumbers(NUMBER_WITH_BAD_CHARACTERS), false, `Expected ${NUMBER_WITH_BAD_CHARACTERS} to not be allowed because it only contains the letter O`);
    });
});

describe('Checking that spaces and dashes within a number are removed ', () => {

    it('A valid 07 number with spaces will be cleaned into one without. ', async function () {
        assert.equal(removeSpaceAndDash(VALID_NUMBER_STARTING_WITH_0_CONTAINING_SPACES), VALID_NUMBER_STARTING_WITH_0, `Expected ${VALID_NUMBER_STARTING_WITH_0_CONTAINING_SPACES} to be ${VALID_NUMBER_STARTING_WITH_0}`);
    })

    it('A valid +44 number with spaces will be cleaned into one without. ', async function () {
        assert.equal(removeSpaceAndDash(VALID_NUMBER_STARTING_WITH_PLUS_44_CONTAINING_SPACES), VALID_NUMBER_STARTING_WITH_PLUS_44, `Expected ${VALID_NUMBER_STARTING_WITH_PLUS_44_CONTAINING_SPACES} to be ${VALID_NUMBER_STARTING_WITH_PLUS_44}`);
    })


    it('A valid 07 number with dashes will be cleaned into one without. ', async function () {
        assert.equal(removeSpaceAndDash(VALID_NUMBER_STARTING_WITH_0_CONTAINING_DASHES), VALID_NUMBER_STARTING_WITH_0, `Expected ${VALID_NUMBER_STARTING_WITH_0_CONTAINING_DASHES} to be ${VALID_NUMBER_STARTING_WITH_0}`);
    })

    it('A valid +44 number with dashes will be cleaned into one without. ', async function () {
        assert.equal(removeSpaceAndDash(VALID_NUMBER_STARTING_WITH_PLUS_44_CONTAINING_DASHES), VALID_NUMBER_STARTING_WITH_PLUS_44, `Expected ${VALID_NUMBER_STARTING_WITH_PLUS_44_CONTAINING_DASHES} to be ${VALID_NUMBER_STARTING_WITH_PLUS_44}`);
    })

    it('A valid 07 number without spaces will not be cleaned ', async function () {
        assert.equal(removeSpaceAndDash(VALID_NUMBER_STARTING_WITH_0), VALID_NUMBER_STARTING_WITH_0, `Expected ${VALID_NUMBER_STARTING_WITH_0} to be ${VALID_NUMBER_STARTING_WITH_0}`);
    })

    it('A valid +44 number without spaces will not be cleaned . ', async function () {
        assert.equal(removeSpaceAndDash(VALID_NUMBER_STARTING_WITH_PLUS_44), VALID_NUMBER_STARTING_WITH_PLUS_44, `Expected ${VALID_NUMBER_STARTING_WITH_PLUS_44} to be ${VALID_NUMBER_STARTING_WITH_PLUS_44}`);
    })
})

describe('Checking that only numbers starting with +447[1-9] and 07[1-9] are accepted', () => {
    it('An invalid +48 number is rejected.', async function () {
        assert.equal(ukNumberCheck(INVALID_NUMBER_STARTING_WITH_PLUS_48), false, `${INVALID_NUMBER_STARTING_WITH_PLUS_48} should not be allowed as it does not begin with +447`);
    })

    it('A valid +44 number is accepted.', async function () {
        assert.equal(ukNumberCheck(VALID_NUMBER_STARTING_WITH_PLUS_44), true, `${VALID_NUMBER_STARTING_WITH_PLUS_44} should be allowed as it begins with +447`);
    })

    it('An invalid 08 number is rejected.', async function () {
        assert.equal(ukNumberCheck(NUMBER_BEGINNING_WITH_08), false, `${NUMBER_BEGINNING_WITH_08} should not be allowed as it does not begin with +447`);
    })

    it('An valid 07 number is accepted.', async function () {
        assert.equal(ukNumberCheck(VALID_NUMBER_STARTING_WITH_0), true, `${VALID_NUMBER_STARTING_WITH_0} should be allowed as it begins with 07`);
    })
})

describe('Checking that numbers starting with +4470 and 070 are recognised', () => {

    it('Checking that numbers which begin with 070 or +4470 are recognised . ', async function () {
        assert.equal(beginsWith070(NUMBER_BEGINNING_WITH_070), true, `${NUMBER_BEGINNING_WITH_070} should be recognised as a number beginning with 070`);
        assert.equal(beginsWith070(NUMBER_BEGINNING_WITH_PLUS_4470), true, `${NUMBER_BEGINNING_WITH_PLUS_4470}  should be recognised as a number beginning with +4470`);
    })

    it('Checking that numbers which begin with 07 or +447 are rejected. ', async function () {
        assert.equal(beginsWith070(VALID_NUMBER_STARTING_WITH_0), false, `${VALID_NUMBER_STARTING_WITH_0} should be rejected`); // not a 070 number
        assert.equal(beginsWith070(VALID_NUMBER_STARTING_WITH_PLUS_44), false, `${VALID_NUMBER_STARTING_WITH_PLUS_44} should be rejected`); // not a 070 number
    })
})

describe('Checking that only numbers which have 10 digits after +44 are accepted', () => {
    // function is only used on numbers which have been converted from 07 to +44 so no need to test 07 numbers.
    // function counts digits after +44
    it('Checking that converted numbers which are 10 digits long after +44 are accepted. ', async function () {
        assert.equal(await lengthCheck(VALID_NUMBER_STARTING_WITH_PLUS_44), true, `${VALID_NUMBER_STARTING_WITH_PLUS_44} should be allowed`);
    })

    it('Checking that converted numbers which are over 10 digits long after +44 are rejected. ', async function () {
        assert.equal(await lengthCheck(VALID_NUMBER_STARTING_WITH_PLUS_44_WITH_OVER_10_DIGITS), false, `${VALID_NUMBER_STARTING_WITH_PLUS_44_WITH_OVER_10_DIGITS} should not be allowed`);
    })

    it('Checking that converted numbers which are under 10 digits long after +44 are rejected. ', async function () {
        assert.equal(await lengthCheck(VALID_NUMBER_STARTING_WITH_PLUS_44_WITH_LESS_THAN_10_DIGITS), false, `${VALID_NUMBER_STARTING_WITH_PLUS_44_WITH_LESS_THAN_10_DIGITS} should not be allowed`);
    })

})

// conversion happens after the number has been validated as a UK number.
describe('Checking that a correctly formatted number beginning with 07 is converted to one beginning with +44', () => {

    it('Checking that number is converted to the correct format. ', async function () {
        assert.equal(convert07Numbers(VALID_NUMBER_STARTING_WITH_0), VALID_NUMBER_STARTING_WITH_PLUS_44, `output should be ${VALID_NUMBER_STARTING_WITH_0}`);
    });

    it('Checking that +44 numbers are not changed', async function () {
        assert.equal(convert07Numbers(VALID_NUMBER_STARTING_WITH_PLUS_44), VALID_NUMBER_STARTING_WITH_PLUS_44, `output should be ${VALID_NUMBER_STARTING_WITH_PLUS_44}`);
    });

    it('Checking that +44 numbers are not changed', async function () {
        assert.equal(convert07Numbers(VALID_NUMBER_STARTING_WITH_PLUS_44), VALID_NUMBER_STARTING_WITH_PLUS_44, `output should be ${VALID_NUMBER_STARTING_WITH_PLUS_44}`);
    });
})
