import commonPasswordsSingleton from "lib/commonPasswords/commonPasswordsSingleton";

const COMMON_PASSWORD = "Password123";
const UNCOMMON_PASSWORD = "this-is-not-a-common-password";

describe("Only common passwords are excluded", () => {
    it(`Does not allow ${COMMON_PASSWORD}`, async () => {
        expect((await commonPasswordsSingleton).notOnList(COMMON_PASSWORD)).toBe(false);
    });

    it(`Does allow ${UNCOMMON_PASSWORD}`, async () => {
        expect((await commonPasswordsSingleton).notOnList(UNCOMMON_PASSWORD)).toBe(true);
    });
});
