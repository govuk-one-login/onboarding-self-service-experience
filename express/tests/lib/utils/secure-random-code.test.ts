import {secureRandom6DigitCode} from "../../../src/lib/utils/secure-random-code";

describe("secureRandom6DigitCode tests", () => {
    it("generates a random 6 digit code", () => {
        const code = secureRandom6DigitCode();
        expect(typeof code).toBe("string");
        expect(code.length).toBe(6);
    });
});
