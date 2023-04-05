import getAuthApiCompliantPublicKey from "lib/publicKeyUtils";

export const VALID_PUBLIC_KEY_NO_HEADERS_OR_LINE_BREAKS =
    "MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEAvHnTrfO+dPO9Qi/m2lMQnI1BDbyyJtmRqvYT4+bqgps8vY6pWjcDf7C8WeVgJozD4QaWIb35MlpTzTNCExVDPHROwfEGwa8q2ul4AxdwHIon+X9MqAlzLzSzaSvY0j5QHVHSabcgOGuRfCYH1gkY9suIvWbiO867+JBGUnL4H5uGtUDWqZkiAhPgC09G8cfCXa3xFL/BE1ZSyrQSNiHeJZ73cMEVok4Lnc7Kud0quE0PFt+4fNc8zDtXCVAW+W4zKeNCZYwLsu+2zgDLrd21W+NUhUSOczuqARbnuxBBtpyEzfVBii6RT26y9lKBJu1cSxWzN8TAZvLaCd2WDplQPaAq1vlSwa60hIztS8JEdpqgUh/VvY1JUFXAhvs+enC4ZHjJAcSmlPQhbB8FLmzK6OAsNv6jd+j5i3PhT+Ep4LSJikVLUUj3E5NRHtfTV9Ou6Ginrtire0+zgDwO9PWLyUsDFW32iN5s4jnawIRZQUSM77t9McHS7QOTLFkUDNxHAgMBAAE=";

export const VALID_PUBLIC_KEY_WITH_HEADERS =
    "-----BEGIN PUBLIC KEY-----\n" +
    "MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEAvHnTrfO+dPO9Qi/m2lMQ\n" +
    "nI1BDbyyJtmRqvYT4+bqgps8vY6pWjcDf7C8WeVgJozD4QaWIb35MlpTzTNCExVD\n" +
    "PHROwfEGwa8q2ul4AxdwHIon+X9MqAlzLzSzaSvY0j5QHVHSabcgOGuRfCYH1gkY\n" +
    "9suIvWbiO867+JBGUnL4H5uGtUDWqZkiAhPgC09G8cfCXa3xFL/BE1ZSyrQSNiHe\n" +
    "JZ73cMEVok4Lnc7Kud0quE0PFt+4fNc8zDtXCVAW+W4zKeNCZYwLsu+2zgDLrd21\n" +
    "W+NUhUSOczuqARbnuxBBtpyEzfVBii6RT26y9lKBJu1cSxWzN8TAZvLaCd2WDplQ\n" +
    "PaAq1vlSwa60hIztS8JEdpqgUh/VvY1JUFXAhvs+enC4ZHjJAcSmlPQhbB8FLmzK\n" +
    "6OAsNv6jd+j5i3PhT+Ep4LSJikVLUUj3E5NRHtfTV9Ou6Ginrtire0+zgDwO9PWL\n" +
    "yUsDFW32iN5s4jnawIRZQUSM77t9McHS7QOTLFkUDNxHAgMBAAE=\n" +
    "-----END PUBLIC KEY-----\n";

describe("public keys are properly prepared for the auth API call", () => {
    it("accepts a valid public key with no headers and no line breaks", () => {
        expect(getAuthApiCompliantPublicKey(VALID_PUBLIC_KEY_NO_HEADERS_OR_LINE_BREAKS)).toEqual(
            VALID_PUBLIC_KEY_NO_HEADERS_OR_LINE_BREAKS
        );
    });

    it("accepts a valid public key with headers and line breaks", () => {
        expect(getAuthApiCompliantPublicKey(VALID_PUBLIC_KEY_WITH_HEADERS)).toEqual(VALID_PUBLIC_KEY_NO_HEADERS_OR_LINE_BREAKS);
    });
});
