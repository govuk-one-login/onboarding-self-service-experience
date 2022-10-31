import {atLeastOneCharacter} from "../../src/middleware/validators/serviceNameValidator";

const SERVICE_NAME_WITH_EMPTY_VALUE = "";
const SERVICE_NAME_1_CHAR = "A";

describe("Service name validator", () => {
    it("checks that the service name has at least one character", () => {
        expect(atLeastOneCharacter(SERVICE_NAME_1_CHAR)).toBe(true);
    });

    it("rejects an empty value", () => {
        expect(atLeastOneCharacter(SERVICE_NAME_WITH_EMPTY_VALUE)).toBe(false);
    });
});
