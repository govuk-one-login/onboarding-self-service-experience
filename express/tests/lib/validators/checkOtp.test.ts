import {validateSecurityCode} from "../../../src/lib/validators/checkOtp";

describe("Validate security codes", () => {
    it("Accept valid 6 digit codes", () => {
        expect(validateSecurityCode("123456").isValid).toEqual(true);
    });

    it("Reject codes longer than 6 digits", () => {
        expect(validateSecurityCode("1234567").isValid).toEqual(false);
    });

    it("Reject codes shorter than 6 digits", () => {
        expect(validateSecurityCode("123").isValid).toEqual(false);
    });

    it("Reject empty codes", () => {
        expect(validateSecurityCode("").isValid).toEqual(false);
    });

    it("Reject codes containing alpha characters", () => {
        expect(validateSecurityCode("test12").isValid).toEqual(false);
    });

    it("Reject codes containing special characters", () => {
        expect(validateSecurityCode("123$%^").isValid).toEqual(false);
    });
});
