import { assert } from "chai";
import { atLeastOneCharacter } from "../../src/middleware/serviceNameValidator";

const SERVICE_NAME_WITH_EMPTY_VALUE = '';
const SERVICE_NAME_1_CHAR = 'A';


describe('Checking that the user has entered a valid Service Name', () => {
    it('a valid "A" 1 character Service Name is accepted. ', async function () {
        assert.equal(atLeastOneCharacter(SERVICE_NAME_1_CHAR), true, `Expected ${SERVICE_NAME_1_CHAR} to be allowed because it has 1 or more characters`);
    });
    it('a Service Name with empty value is not accepted. ', async function () {
        assert.equal(atLeastOneCharacter(SERVICE_NAME_WITH_EMPTY_VALUE), false, `Expected ${SERVICE_NAME_WITH_EMPTY_VALUE} not to be allowed because it has empty value`);
    });
});
