import {validateAuthorisationHeader} from "../../../api/src/handlers/helper/validate-authorisation-header";
import {TEST_ACCESS_TOKEN, TEST_USER_ID} from "../handlers/constants";

describe("validateAuthorisationHEader tests", () => {
    it("returns a 401 for no access token", () => {
        expect(validateAuthorisationHeader(undefined)).toStrictEqual({
            valid: false,
            errorResponse: {
                statusCode: 401,
                body: "Missing access token"
            }
        });
    });

    it("returns a 401 for access token that does not start with Bearer", () => {
        expect(validateAuthorisationHeader("Invalid Token")).toStrictEqual({
            valid: false,
            errorResponse: {
                statusCode: 401,
                body: "Missing access token"
            }
        });
    });

    it("returns 400 for an invalid access token that is not a valid signed JWT", () => {
        expect(validateAuthorisationHeader("Bearer Invalid")).toStrictEqual({
            valid: false,
            errorResponse: {
                statusCode: 400,
                body: "Invalid access token"
            }
        });
    });

    it("returns 400 if the subject claim is not a string", () => {
        expect(validateAuthorisationHeader("Bearer " + Buffer.from(JSON.stringify({sub: 123456789})).toString("base64url"))).toStrictEqual({
            valid: false,
            errorResponse: {
                statusCode: 400,
                body: "Invalid access token"
            }
        });
    });

    it("returns userId from the subject claim when valid", () => {
        expect(validateAuthorisationHeader("Bearer " + TEST_ACCESS_TOKEN)).toStrictEqual({
            valid: true,
            userId: TEST_USER_ID
        });
    });
});
