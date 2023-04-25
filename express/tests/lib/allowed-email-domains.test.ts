import {validateEmail} from "../../src/lib/validators/emailValidator";

jest.mock("fs/promises", () => {
    return {
        readFile: jest.fn(() => `.partial.subdomain\nfull.domain`)
    };
});

const allowedDomain = "full.domain";
const allowedSubDomain = ".partial.subdomain";

describe("Verify email domains", () => {
    describe("Accept valid domains", () => {
        it("Allows an email address with a domain on the allowed list", async () => {
            expect((await validateEmail(`email@${allowedDomain}`)).isValid).toBe(true);
        });

        it("Allows an email address ending with a domain on the allowed list", async () => {
            expect((await validateEmail(`email@top.level.${allowedDomain}`)).isValid).toBe(true);
        });

        it("Allows an email address ending with a subdomain on the allowed list", async () => {
            expect((await validateEmail(`email@top.level${allowedSubDomain}`)).isValid).toBe(true);
        });
    });

    describe("Reject invalid domains", () => {
        it("Rejects an email address with a domain not on the allowed list", async () => {
            expect((await validateEmail("email@bad.domain")).isValid).toBe(false);
        });

        it("Rejects an email address not ending with a domain on the allowed list", async () => {
            expect((await validateEmail(`email@${allowedDomain}.subdomain`)).isValid).toBe(false);
        });

        it("Rejects an email address not ending with a subdomain on the allowed list", async () => {
            expect((await validateEmail(`email@top.level.${allowedSubDomain}.subdomain`)).isValid).toBe(false);
        });
    });
});
