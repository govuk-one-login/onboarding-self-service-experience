import isRfc822Compliant from "../../src/lib/rfc822-validate";
import {isAllowedDomain} from "../../src/middleware/emailValidator";

const EMAIL_WITH_ALLOWED_DOMAIN = "allowed@email.gov.uk";
const EMAIL_WITH_DISALLOWED_DOMAIN = "allowed@hackers.co.uk";

const EMAIL_WITH_NO_AT_SYMBOL = "copyAndPaste_at_some.domain";
const EMAIL_COMPLYING_WITH_RFC822 = "an_Email+modification@some.domain";
const EMAIL_UNDERSCORE_AFTER_AT_SYMBOL = "copyAndPaste@_some.domain";

describe("Checking that the email domain is on the allowed list", () => {
    it("should accept an email with a domain in the list of allowed domains", async () => {
        expect(await isAllowedDomain(EMAIL_WITH_ALLOWED_DOMAIN)).toBe(true);
    });

    it("should reject an email with a domain that is not in the list of allowed domains", async () => {
        expect(await isAllowedDomain(EMAIL_WITH_DISALLOWED_DOMAIN)).toBe(false);
    });
});

describe("Checking that well formed email addresses are accepted and badly formed ones are not", () => {
    it(`should accept the email address ${EMAIL_COMPLYING_WITH_RFC822}`, () => {
        expect(isRfc822Compliant(EMAIL_COMPLYING_WITH_RFC822)).toBe(true);
    });

    it(`should reject the email address ${EMAIL_WITH_NO_AT_SYMBOL}`, () => {
        expect(isRfc822Compliant(EMAIL_WITH_NO_AT_SYMBOL)).toBe(false);
    });

    it(`should reject the email address ${EMAIL_UNDERSCORE_AFTER_AT_SYMBOL}`, () => {
        expect(isRfc822Compliant(EMAIL_WITH_NO_AT_SYMBOL)).toBe(false);
    });
});
