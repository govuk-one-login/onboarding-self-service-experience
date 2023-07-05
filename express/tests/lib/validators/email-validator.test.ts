import validateEmail from "lib/validators/email-validator";

jest.mock("fs/promises", () => {
    return {
        readFile: jest.fn(() => `allowed.domain\n.gov.uk`)
    };
});

describe("Verify email addresses", () => {
    describe("Check that an email domain is allowed", () => {
        it("Accept an allowed domain", async () => {
            expect((await validateEmail("email@allowed.domain")).isValid).toBe(true);
        });

        it("Reject a domain not on the allowed list", async () => {
            expect(await validateEmail("allowed@hackers.co.uk")).toEqual({
                isValid: false,
                errorMessage: expect.stringMatching(/government.*email/)
            });
        });
    });

    describe("Verify an email address is formatted correctly", () => {
        it("Accept an RFC822 compliant email address", async () => {
            expect((await validateEmail("an_Email+modification@test.gov.uk")).isValid).toBe(true);
        });

        it("Reject an email without the @ symbol", async () => {
            expect(await validateEmail("copyAndPaste_at_some.domain.gov.uk")).toEqual({
                isValid: false,
                errorMessage: expect.stringMatching(/correct.*format/)
            });
        });

        it("Accept an email with an _ after the @ symbol", async () => {
            expect((await validateEmail("emailWithUNderscoreAfterAtSymbol@_domain.gov.uk")).isValid).toBe(true);
        });
    });
});
