import {assert} from "chai";
import isRfc822Compliant from "../../src/lib/rfc822-validate";
import {isAllowedDomain} from "../../src/middleware/emailValidator";

const EMAIL_WITH_ALLOWED_DOMAIN = "allowed@email.gov.uk";
const EMAIL_WITH_DISALLOWED_DOMAIN = "allowed@hackers.co.uk";

const EMAIL_WITH_NO_AT_SYMBOL = "copyAndPaste_at_some.domain";
const EMAIL_COMPLYING_WITH_RFC822 = "an_Email+modification@some.domain";

describe("Checking that the email domain is on the allowed list in 'allowed-email-domains.txt'", () => {
    it("should return true for an email with a domain in the list of allowed domains", async () => {
        assert.equal(await isAllowedDomain(EMAIL_WITH_ALLOWED_DOMAIN), true, `${EMAIL_WITH_ALLOWED_DOMAIN} should be allowed`);
    });

    it("should return false for an email with a domain that is not in the list of allowed domains", async () => {
        assert.equal(await isAllowedDomain(EMAIL_WITH_DISALLOWED_DOMAIN), false, `${EMAIL_WITH_DISALLOWED_DOMAIN} should not be allowed`);
    });
});

describe("Checking that well formed email addresses are accepted and badly formed ones are not", () => {
    it(`should return true for the email address ${EMAIL_COMPLYING_WITH_RFC822}`, () => {
        assert.equal(
            isRfc822Compliant(EMAIL_COMPLYING_WITH_RFC822),
            true,
            `Expected ${EMAIL_COMPLYING_WITH_RFC822} to be recognised as valid`
        );
    });

    it(`should return false for the email address ${EMAIL_WITH_NO_AT_SYMBOL}`, () => {
        assert.equal(isRfc822Compliant(EMAIL_WITH_NO_AT_SYMBOL), false, `Expected ${EMAIL_WITH_NO_AT_SYMBOL} to be rejected as invalid`);
    });
});
