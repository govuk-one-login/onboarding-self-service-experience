import { assert } from "chai";
import commonPasswordsSingleton from "../../src/middleware/notOnCommonPasswordListValidator/commonPasswordsSingleton";

const COMMON_PASSWORD = "Password123";
const UNCOMMON_PASSWORD = "this-is-not-a-common-password";

describe('Only common passwords are excluded', () => {

    it(`Does not allow ${COMMON_PASSWORD}`, async function () {
        assert.isFalse((await commonPasswordsSingleton).notOnList(COMMON_PASSWORD));
    });

    it(`Does allow ${UNCOMMON_PASSWORD}`, async function () {
        assert.isTrue((await commonPasswordsSingleton).notOnList(UNCOMMON_PASSWORD));
    });
});
