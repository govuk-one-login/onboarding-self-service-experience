import getAuthApiCompliantPublicKey from "lib/public-key";

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

describe("Public keys are validated and prepared for the Auth API", () => {
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
