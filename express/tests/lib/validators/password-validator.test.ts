import validatePassword from "../../../src/lib/validators/password-validator";

const password8Chars = "12345678";

describe("Validate passwords", () => {
    it("Reject an empty value", () => {
        expect(validatePassword("").isValid).toBe(false);
    });

    it("Reject a whitespace-only value", () => {
        expect(validatePassword("        ").isValid).toBe(false);
    });

    it("Accept a password with 8 characters", () => {
        expect(validatePassword(password8Chars).isValid).toBe(true);
    });

    it("Accept a password with more than 8 characters", () => {
        expect(validatePassword(`${password8Chars}9`).isValid).toBe(true);
    });

    it("Reject a password with less than 8 characters", () => {
        expect(validatePassword(password8Chars.substring(1, 7))).toEqual({
            isValid: false,
            errorMessage: expect.stringContaining("8 characters or more")
        });
    });

    describe("Accept passwords with spaces", () => {
        it("Accept a password with leading spaces", () => {
            expect(validatePassword(`   ${password8Chars}`).isValid).toBe(true);
        });

        it("Accept a password with trailing spaces", () => {
            expect(validatePassword(`${password8Chars}   `).isValid).toBe(true);
        });

        it("Accept a password with spaces in the middle", () => {
            expect(validatePassword(`${password8Chars.substring(0, 4)}   ${password8Chars.substring(4)}`).isValid).toBe(true);
        });
    });
});
