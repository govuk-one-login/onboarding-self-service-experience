import validateUri from "../../../src/lib/validators/uri-validator";

describe("Validate URIs", () => {
    it("Reject empty value", () => {
        expect(validateUri("").isValid).toBe(false);
    });

    it("Accepts a single valid URL", () => {
        expect(validateUri("https://some.gov.uk/url").isValid).toBe(true);
    });

    it("Reject a single invalid URL", () => {
        expect(validateUri("some.gov.uk/url")).toEqual({
            isValid: false,
            errorMessage: expect.stringContaining("in the format https://example.com")
        });
    });

    it("Accept http for a localhost URL", () => {
        expect(validateUri("http://localhost/link").isValid).toBe(true);
    });

    it("Accept http for a non-localhost URL", () => {
        expect(validateUri("http://some.gov.uk/link").isValid).toBe(true);
    });
});
