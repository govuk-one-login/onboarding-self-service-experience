import hasAllowedDomain from "../../../src/lib/validators/allowed-email-domains";

jest.mock("fs/promises", () => {
    return {
        readFile: jest.fn(() => `.partial.subdomain\nfull.domain`)
    };
});

const allowedDomain = "full.domain";
const allowedSubDomain = ".partial.subdomain";

describe("Verify email domains", () => {
    describe("Accept valid domains", () => {
        it("Allow an email address with a domain on the allowed list", async () => {
            expect(await hasAllowedDomain(`email@${allowedDomain}`)).toBe(true);
        });

        it("Allow an email address ending with a domain on the allowed list", async () => {
            expect(await hasAllowedDomain(`email@top.level.${allowedDomain}`)).toBe(true);
        });
    });

    describe("Reject invalid domains", () => {
        it("Reject an email address with a domain not on the allowed list", async () => {
            expect(await hasAllowedDomain("email@bad.domain")).toBe(false);
        });

        it("Reject an email address not ending with a domain on the allowed list", async () => {
            expect(await hasAllowedDomain(`email@${allowedDomain}.subdomain`)).toBe(false);
        });

        it("Reject an email address not ending with a subdomain on the allowed list", async () => {
            expect(await hasAllowedDomain(`email@top.level.${allowedSubDomain}.subdomain`)).toBe(false);
        });

        it("Rejects an email address where the allowed domain is a substring but not a subdomain", async () => {
            expect(await hasAllowedDomain(`email@evil.not${allowedSubDomain}`)).toBe(false);
        });
    });
});
