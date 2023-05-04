import validateSecurityCode from "lib/validators/security-code-validator";

describe("Validate security codes", () => {
    it("Accept valid 6 digit codes", () => {
        expect(validateSecurityCode("123456").isValid).toBe(true);
    });

    it("Reject empty codes", () => {
        expect(validateSecurityCode("")).toEqual({isValid: false, errorMessage: expect.stringContaining("6 digit")});
    });

    it("Reject codes longer than 6 digits", () => {
        expect(validateSecurityCode("1234567")).toEqual({isValid: false, errorMessage: expect.stringContaining("6 digit")});
    });

    it("Reject codes shorter than 6 digits", () => {
        expect(validateSecurityCode("123")).toEqual({isValid: false, errorMessage: expect.stringContaining("6 digit")});
    });

    it("Reject codes containing alpha characters", () => {
        expect(validateSecurityCode("test12")).toEqual({isValid: false, errorMessage: expect.stringMatching(/only.*numbers/)});
    });

    it("Reject codes containing special characters", () => {
        expect(validateSecurityCode("123$%^")).toEqual({isValid: false, errorMessage: expect.stringMatching(/only.*numbers/)});
    });
});
