import {validateEmail} from "../../src/lib/validators/emailValidator";

const EMAIL_WITH_ALLOWED_DOMAIN = "allowed@email.gov.uk";
const EMAIL_WITH_DISALLOWED_DOMAIN = "allowed@hackers.co.uk";

const EMAIL_WITH_NO_AT_SYMBOL = "copyAndPaste_at_some.domain.gov.uk";
const EMAIL_COMPLYING_WITH_RFC822 = "an_Email+modification@some.domain.gov.uk";
const EMAIL_WITH_UNDERSCORE_AFTER_AT_SYMBOL = "emailWithUNderscoreAfterAtSymbol@_domain.gov.uk";

describe("Checking that the email domain is on the allowed list in 'allowed-email-domains.txt'", () => {
    it("should return true for an email with a domain in the list of allowed domains", async () => {
        expect(await validateEmail(EMAIL_WITH_ALLOWED_DOMAIN)).toEqual({isValid: true});
    });

    it("should return false for an email with a domain that is not in the list of allowed domains", async () => {
        expect(await validateEmail(EMAIL_WITH_DISALLOWED_DOMAIN)).toEqual({
            isValid: false,
            errorMessage: "Enter a government email address"
        });
    });
});

describe("Checking that well formed email addresses are accepted and badly formed ones are not", () => {
    it(`should return true for the email address ${EMAIL_COMPLYING_WITH_RFC822}`, async () => {
        expect(await validateEmail(EMAIL_COMPLYING_WITH_RFC822)).toEqual({isValid: true});
    });

    it(`should return false for the email address ${EMAIL_WITH_NO_AT_SYMBOL}`, async () => {
        expect(await validateEmail(EMAIL_WITH_NO_AT_SYMBOL)).toEqual({
            isValid: false,
            errorMessage: "Enter an email address in the correct format, like name@example.com"
        });
    });

    it(`should return true for the email address ${EMAIL_WITH_UNDERSCORE_AFTER_AT_SYMBOL}`, async () => {
        expect(await validateEmail(EMAIL_WITH_UNDERSCORE_AFTER_AT_SYMBOL)).toEqual({
            isValid: true
        });
    });
});
