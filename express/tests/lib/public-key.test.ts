import getAuthApiCompliantPublicKey, {isPublicKeyValid, validateJwksURL} from "../../src/lib/public-key";
import {TEST_JWKS_KEY_UPDATE} from "../constants";

const header = "-----BEGIN PUBLIC KEY-----";
const footer = "-----END PUBLIC KEY-----";

export const publicKey = `
MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEAvHnTrfO+dPO9Qi/m2lMQ
nI1BDbyyJtmRqvYT4+bqgps8vY6pWjcDf7C8WeVgJozD4QaWIb35MlpTzTNCExVD
PHROwfEGwa8q2ul4AxdwHIon+X9MqAlzLzSzaSvY0j5QHVHSabcgOGuRfCYH1gkY
9suIvWbiO867+JBGUnL4H5uGtUDWqZkiAhPgC09G8cfCXa3xFL/BE1ZSyrQSNiHe
JZ73cMEVok4Lnc7Kud0quE0PFt+4fNc8zDtXCVAW+W4zKeNCZYwLsu+2zgDLrd21
W+NUhUSOczuqARbnuxBBtpyEzfVBii6RT26y9lKBJu1cSxWzN8TAZvLaCd2WDplQ
PaAq1vlSwa60hIztS8JEdpqgUh/VvY1JUFXAhvs+enC4ZHjJAcSmlPQhbB8FLmzK
6OAsNv6jd+j5i3PhT+Ep4LSJikVLUUj3E5NRHtfTV9Ou6Ginrtire0+zgDwO9PWL
yUsDFW32iN5s4jnawIRZQUSM77t9McHS7QOTLFkUDNxHAgMBAAE=
`.trim();

export const publicKeyWithHeaders = `${header}\n${publicKey}\n${footer}`;
export const publicKeyCompact = publicKey.replaceAll("\n", "");
export const publicKeyCompactWithHeaders = `${header}\n${publicKeyCompact}\n${footer}`;

describe("Static public keys are validated and prepared for the Auth API", () => {
    describe("Valid public keys are correctly transformed", () => {
        it("Accepts a valid public key with no headers and no line breaks", () => {
            expect(getAuthApiCompliantPublicKey(publicKeyCompact)).toEqual(publicKeyCompact);
        });

        it("Accepts a valid public key with headers and no line breaks", () => {
            expect(getAuthApiCompliantPublicKey(publicKeyCompactWithHeaders)).toEqual(publicKeyCompact);
        });

        it("Accepts a valid public key with line breaks and no headers", () => {
            expect(getAuthApiCompliantPublicKey(publicKey)).toEqual(publicKeyCompact);
        });

        it("Accepts a valid public key with headers and line breaks", () => {
            expect(getAuthApiCompliantPublicKey(publicKeyWithHeaders)).toEqual(publicKeyCompact);
        });
    });

    describe("Incorrectly formatted keys with valid content are corrected and accepted", () => {
        describe.each([
            {key: publicKey, type: "multiline"},
            {key: publicKeyCompact, type: "compact"}
        ])("Keys with missing begin or end lines are accepted", ({key, type}) => {
            it(`Accepts and corrects a ${type} key without the header`, () => {
                expect(getAuthApiCompliantPublicKey(`${key}\n${footer}`)).toEqual(publicKeyCompact);
            });

            it(`Accepts and corrects a ${type} key without the footer`, () => {
                expect(getAuthApiCompliantPublicKey(`${header}\n${key}`)).toEqual(publicKeyCompact);
            });
        });

        describe.each([
            {whitespace: "\n\n\n", whitespaceName: "newlines"},
            {whitespace: "   ", whitespaceName: "spaces"},
            {whitespace: "     \n      \n\n\n   ", whitespaceName: "space"}
        ])("Keys with extra whitespace are correced and accepted", ({whitespace, whitespaceName}) => {
            describe("Keys with extra whitespace outside the key content are accepted", () => {
                describe.each([
                    {key: publicKey, type: "multiline"},
                    {key: publicKeyWithHeaders, type: "wrapped multiline"},
                    {key: publicKeyCompact, type: "compact"},
                    {key: publicKeyCompactWithHeaders, type: "wrapped compact"}
                ])(`Keys with extra ${whitespaceName} outside the key content are accepted`, ({key, type}) => {
                    it(`Accepts a ${type} key with extra ${whitespaceName} before the key content`, () => {
                        expect(getAuthApiCompliantPublicKey(`${whitespace}${key}`)).toEqual(publicKeyCompact);
                    });

                    it(`Accepts a ${type} key with extra ${whitespaceName} after the key content`, () => {
                        expect(getAuthApiCompliantPublicKey(`${key}${whitespace}`)).toEqual(publicKeyCompact);
                    });

                    it(`Accepts a ${type} key with extra ${whitespaceName} before and after the key content`, () => {
                        expect(getAuthApiCompliantPublicKey(`${whitespace}${key}${whitespace}`)).toEqual(publicKeyCompact);
                    });
                });
            });

            describe("Keys with extra whitespace inside the key content are accepted", () => {
                describe.each([
                    {key: publicKey, type: "multiline"},
                    {key: publicKeyCompact, type: "compact"}
                ])(`Keys with extra ${whitespaceName} inside the key content are accepted`, ({key, type}) => {
                    it(`Accepts a ${type} key with extra ${whitespaceName} after the header`, () => {
                        expect(getAuthApiCompliantPublicKey(`${header}${whitespace}${key}${footer}`)).toEqual(publicKeyCompact);
                    });

                    it(`Accepts a ${type} key with extra ${whitespaceName} before the footer`, () => {
                        expect(getAuthApiCompliantPublicKey(`${header}${key}${whitespace}${footer}`)).toEqual(publicKeyCompact);
                    });

                    it(`Accepts a ${type} key with extra ${whitespaceName} inside the main part`, () => {
                        expect(
                            getAuthApiCompliantPublicKey(`${header}${key.substring(0, 20)}${whitespace}${key.substring(20)}${footer}`)
                        ).toEqual(publicKeyCompact);
                    });

                    it(`Accepts a ${type} key with extra ${whitespaceName}`, () => {
                        expect(
                            getAuthApiCompliantPublicKey(
                                `${header}${whitespace}${key.substring(0, 20)}${whitespace}${key.substring(20)}${whitespace}${footer}`
                            )
                        ).toEqual(publicKeyCompact);
                    });
                });
            });
        });

        describe("Keys with extra text outside the key content are accepted", () => {
            it("Accepts a key with extra text before the header", () => {
                expect(getAuthApiCompliantPublicKey(`not-part-of-the-key\n${publicKeyWithHeaders}`)).toEqual(publicKeyCompact);
                expect(getAuthApiCompliantPublicKey(`not-part-of-the-key${publicKeyWithHeaders}`)).toEqual(publicKeyCompact);
            });

            it("Accepts a key with extra text after the footer", () => {
                expect(getAuthApiCompliantPublicKey(`${publicKeyWithHeaders}\nnot-part-of-the-key`)).toEqual(publicKeyCompact);
                expect(getAuthApiCompliantPublicKey(`${publicKeyWithHeaders}not-part-of-the-key`)).toEqual(publicKeyCompact);
            });

            it("Accepts a key with extra text before and after the key content", () => {
                expect(getAuthApiCompliantPublicKey(`text-before\n${publicKeyWithHeaders}\ntext-after`)).toEqual(publicKeyCompact);
                expect(getAuthApiCompliantPublicKey(`text-before${publicKeyWithHeaders}text-after`)).toEqual(publicKeyCompact);
            });
        });
    });

    describe("Invalid public keys are rejected", () => {
        it("Throws an exception when no key has been passed", () => {
            expect(() => getAuthApiCompliantPublicKey("")).toThrow();
        });

        it("Throws an exception when the key has no content", () => {
            expect(() => getAuthApiCompliantPublicKey(`${header}\n${footer}`)).toThrow();
        });

        it("Throws an exception when the key has invalid content", () => {
            const invalidKey = `${header}\ninvalid-public-key-content\n${footer}`;
            expect(() => getAuthApiCompliantPublicKey(invalidKey)).toThrow(invalidKey);
        });
    });
});

describe("Static public keys are validated", () => {
    describe("Valid public keys are accepted", () => {
        it("Accepts a valid public key with headers and line breaks", () => {
            expect(isPublicKeyValid(publicKeyWithHeaders)).toEqual(publicKeyWithHeaders);
        });

        it("Accepts a valid public key with headers and no line breaks", () => {
            expect(isPublicKeyValid(publicKeyCompactWithHeaders)).toEqual(publicKeyCompactWithHeaders);
        });

        it("Accepts a valid public key with line breaks and no headers", () => {
            expect(isPublicKeyValid(publicKey)).toEqual(publicKey);
        });

        it("Accepts a valid public key with headers and line breaks", () => {
            expect(isPublicKeyValid(publicKeyWithHeaders)).toEqual(publicKeyWithHeaders);
        });
    });

    describe("Incorrectly formatted keys with valid content are corrected and accepted", () => {
        describe.each([{key: publicKey, type: "multiline"}])("Keys with missing begin or end lines are accepted", ({key, type}) => {
            it(`Accepts and corrects a ${type} key without the header`, () => {
                const enteredPublicKey = `${key}\n${footer}`;
                expect(isPublicKeyValid(enteredPublicKey)).toEqual(enteredPublicKey);
            });

            it(`Accepts and corrects a ${type} key without the footer`, () => {
                const enteredPublicKey = `${header}\n${key}`;
                expect(isPublicKeyValid(enteredPublicKey)).toEqual(enteredPublicKey);
            });
        });

        describe.each([
            {whitespace: "\n\n\n", whitespaceName: "newlines"},
            {whitespace: "   ", whitespaceName: "spaces"},
            {whitespace: "     \n      \n\n\n   ", whitespaceName: "space"}
        ])("Keys with extra whitespace are correced and accepted", ({whitespace, whitespaceName}) => {
            describe("Keys with extra whitespace outside the key content are accepted", () => {
                describe.each([
                    {key: publicKey, type: "multiline"},
                    {key: publicKeyWithHeaders, type: "wrapped multiline"}
                ])(`Keys with extra ${whitespaceName} outside the key content are accepted`, ({key, type}) => {
                    it(`Accepts a ${type} key with extra ${whitespaceName} before the key content`, () => {
                        const enteredPublicKey = `${whitespace}${key}`;
                        expect(isPublicKeyValid(enteredPublicKey)).toEqual(enteredPublicKey);
                    });

                    it(`Accepts a ${type} key with extra ${whitespaceName} after the key content`, () => {
                        const enteredPublicKey = `${key}${whitespace}`;
                        expect(isPublicKeyValid(enteredPublicKey)).toEqual(enteredPublicKey);
                    });

                    it(`Accepts a ${type} key with extra ${whitespaceName} before and after the key content`, () => {
                        const enteredPublicKey = `${whitespace}${key}${whitespace}`;
                        expect(isPublicKeyValid(enteredPublicKey)).toEqual(enteredPublicKey);
                    });
                });
            });

            describe("Keys with extra whitespace inside the key content are accepted", () => {
                describe.each([
                    {key: publicKey, type: "multiline"},
                    {key: publicKeyCompact, type: "compact"}
                ])(`Keys with extra ${whitespaceName} inside the key content are accepted`, ({key, type}) => {
                    it(`Accepts a ${type} key with extra ${whitespaceName} after the header`, () => {
                        const enteredPublicKey = `${header}${whitespace}${key}${footer}`;
                        expect(isPublicKeyValid(enteredPublicKey)).toEqual(enteredPublicKey);
                    });

                    it(`Accepts a ${type} key with extra ${whitespaceName} before the footer`, () => {
                        const enteredPublicKey = `${header}${key}${whitespace}${footer}`;
                        expect(isPublicKeyValid(enteredPublicKey)).toEqual(enteredPublicKey);
                    });

                    it(`Accepts a ${type} key with extra ${whitespaceName} inside the main part`, () => {
                        const enteredPublicKey = `${header}${key.substring(0, 20)}${whitespace}${key.substring(20)}${footer}`;
                        expect(isPublicKeyValid(enteredPublicKey)).toEqual(enteredPublicKey);
                    });

                    it(`Accepts a ${type} key with extra ${whitespaceName}`, () => {
                        const enteredPublicKey = `${header}${whitespace}${key.substring(0, 20)}${whitespace}${key.substring(
                            20
                        )}${whitespace}${footer}`;
                        expect(isPublicKeyValid(enteredPublicKey)).toEqual(enteredPublicKey);
                    });
                });
            });
        });

        describe("Keys with extra text outside the key content are accepted", () => {
            it("Accepts a key with extra text before the header", () => {
                let enteredPublicKey = `not-part-of-the-key\n${publicKeyWithHeaders}`;
                expect(isPublicKeyValid(enteredPublicKey)).toEqual(enteredPublicKey);

                enteredPublicKey = `not-part-of-the-key${publicKeyWithHeaders}`;
                expect(isPublicKeyValid(enteredPublicKey)).toEqual(enteredPublicKey);
            });

            it("Accepts a key with extra text after the footer", () => {
                let enteredPublicKey = `${publicKeyWithHeaders}\nnot-part-of-the-key`;
                expect(isPublicKeyValid(enteredPublicKey)).toEqual(enteredPublicKey);

                enteredPublicKey = `${publicKeyWithHeaders}not-part-of-the-key`;
                expect(isPublicKeyValid(enteredPublicKey)).toEqual(enteredPublicKey);
            });

            it("Accepts a key with extra text before and after the key content", () => {
                let enteredPublicKey = `text-before\n${publicKeyWithHeaders}\ntext-after`;
                expect(isPublicKeyValid(enteredPublicKey)).toEqual(enteredPublicKey);

                enteredPublicKey = `text-before${publicKeyWithHeaders}text-after`;
                expect(isPublicKeyValid(enteredPublicKey)).toEqual(enteredPublicKey);
            });
        });
    });

    describe("Invalid public keys are rejected", () => {
        it("Throws an exception when no key has been passed", () => {
            expect(() => isPublicKeyValid("")).toThrow();
        });

        it("Throws an exception when the key has no content", () => {
            expect(() => isPublicKeyValid(`${header}\n${footer}`)).toThrow();
        });

        it("Throws an exception when the key has invalid content", () => {
            const invalidKey = `${header}\ninvalid-public-key-content\n${footer}`;
            expect(() => isPublicKeyValid(invalidKey)).toThrow(invalidKey);
        });

        it("Throws an exception when the key is not RSA", () => {
            const invalidKey = `${header}\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE0M8qKD+sKh7OuITZ7tUhHbGsECcxghd4zr7sp2xt9cGxqj41Z0IOjui4A32UHq/2pkTnM9/LtzFM+QzHLJyQxw==\n${footer}`;
            expect(() => isPublicKeyValid(invalidKey)).toThrow(invalidKey);
        });
    });
});

describe("JWKs Urls are validated", () => {
    it("Accepts a valid url", () => {
        expect(validateJwksURL(TEST_JWKS_KEY_UPDATE.jwks_uri)).toEqual(TEST_JWKS_KEY_UPDATE.jwks_uri);
    });
    it("Invalid urls are rejected", () => {
        expect(() => validateJwksURL("someInvalidURL")).toThrow();
    });
});
