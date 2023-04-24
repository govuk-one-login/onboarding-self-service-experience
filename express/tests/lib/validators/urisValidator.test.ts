import {validateUris} from "lib/validators/urisValidator";

describe("URIs are correctly validated", () => {
    it("rejects an empty array", () => {
        expect(validateUris([])).toEqual({isValid: false, errorMessage: "Enter your redirect URIs"});
    });

    it("accepts a single valid URL", () => {
        expect(validateUris(["https://some.gov.uk/url"])).toEqual({isValid: true});
    });

    it("accepts multiple valid URLs", () => {
        expect(validateUris(["https://some.gov.uk/url", "https://some.other.gov.uk/url"])).toEqual({isValid: true});
    });

    it("rejects a single invalid URL, saying which one it is", () => {
        expect(validateUris(["some.gov.uk/url", "https://some.other.gov.uk/url"])).toEqual({
            isValid: false,
            errorMessage: "some.gov.uk/url is not a valid URL"
        });
    });

    it("rejects multiple invalid URLs, listing them", () => {
        expect(validateUris(["some.gov.uk/url", "some.other.gov.uk/url", "https://fine.gov.uk/login"])).toEqual({
            isValid: false,
            errorMessage: "The following URLs are not valid: some.gov.uk/url some.other.gov.uk/url"
        });
    });

    it("accepts http for a localhost URL", () => {
        expect(validateUris(["http://localhost/link"])).toEqual({
            isValid: true
        });
    });

    it("does not accept http for a non localhost URL", () => {
        expect(validateUris(["http://some.gov.uk/link"])).toEqual({
            isValid: false,
            errorMessage: "URLs must be https (except for localhost)"
        });
    });
});
