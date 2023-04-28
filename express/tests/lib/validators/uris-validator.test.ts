import validateUris from "lib/validators/uris-validator";

describe("Validate URIs", () => {
    it("Reject an empty array", () => {
        expect(validateUris([]).isValid).toBe(false);
    });

    it("Reject an array with all empty values", () => {
        expect(validateUris([""]).isValid).toBe(false);
    });

    it("Ignore empty values", () => {
        expect(validateUris(["", "https://some.gov.uk/url"]).isValid).toBe(true);
    });

    it("Accepts a single valid URL", () => {
        expect(validateUris(["https://some.gov.uk/url"]).isValid).toBe(true);
    });

    it("Accepts multiple valid URLs", () => {
        expect(validateUris(["https://some.gov.uk/url", "https://some.other.gov.uk/url"]).isValid).toBe(true);
    });

    it("Reject a single invalid URL", () => {
        expect(validateUris(["some.gov.uk/url", "https://some.other.gov.uk/url"])).toEqual({
            isValid: false,
            errorMessage: expect.stringContaining("in the format https://example.com")
        });
    });

    it("Reject multiple invalid URLs", () => {
        expect(validateUris(["some.gov.uk/url", "some.other.gov.uk/url", "https://fine.gov.uk/login"])).toEqual({
            isValid: false,
            errorMessage: expect.stringContaining("in the format https://example.com")
        });
    });

    it("Accept http for a localhost URL", () => {
        expect(validateUris(["http://localhost/link"]).isValid).toBe(true);
    });

    it("Reject http for a non-localhost URL", () => {
        expect(validateUris(["http://some.gov.uk/link"])).toEqual({
            isValid: false,
            errorMessage: "URLs must be https (except for localhost)"
        });
    });
});
