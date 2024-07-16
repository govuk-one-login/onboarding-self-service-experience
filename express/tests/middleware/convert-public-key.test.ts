import validateKeySource from "../../src/middleware/validate-public-key";
import {publicKeyCompact, publicKeyWithHeaders} from "../lib/public-key.test";
import {request, response} from "../mocks";
import {
    TEST_AUTHENTICATION_RESULT,
    TEST_CLIENT_ID,
    TEST_IP_ADDRESS,
    TEST_SELF_SERVICE_CLIENT_ID,
    TEST_SERVICE_ID,
    TEST_SESSION_ID,
    TEST_BAD_PUBLIC_KEY,
    TEST_STATIC_KEY_UPDATE,
    TEST_JWKS_KEY_UPDATE
} from "../constants";

describe("Validate and convert submitted Static public key", () => {
    it("Call next middleware if public key successfully converted", () => {
        const next = jest.fn();
        const req = request();
        const res = response();

        req.body.serviceUserPublicKey = publicKeyWithHeaders;
        req.body.publicKeySource = TEST_STATIC_KEY_UPDATE.public_key_source;
        validateKeySource(req, res, next);

        expect(req.body.update.jwks_uri).toEqual(undefined);
        expect(req.body.update.public_key_source).toEqual(TEST_STATIC_KEY_UPDATE.public_key_source);
        expect(req.body.update.public_key).toEqual(publicKeyCompact);
        expect(res.render).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalled();
    });

    it("it re-renders with error messages if the public key is invalid", () => {
        const next = jest.fn();
        const req = request({
            body: {
                publicKeySource: TEST_STATIC_KEY_UPDATE.public_key_source,
                serviceUserPublicKey: "someInvalidKey",
                jwksUrl: ""
            },
            context: {
                serviceId: TEST_SERVICE_ID
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            query: {
                publicKey: TEST_STATIC_KEY_UPDATE.public_key
            }
        });
        const res = response();

        validateKeySource(req, res, next);

        expect(res.render).toHaveBeenCalledWith("clients/change-public-key.njk", {
            serviceId: TEST_SERVICE_ID,
            selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
            clientId: TEST_CLIENT_ID,
            errorMessages: {
                serviceUserPublicKey: "Enter a valid public key"
            },
            publicKeySource: TEST_STATIC_KEY_UPDATE.public_key_source,
            serviceUserPublicKey: "someInvalidKey",
            jwksUrl: ""
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("Fail if public key unsuccessfully converted", () => {
        const next = jest.fn();
        const mockReq = request({
            body: {
                publicKeySource: TEST_STATIC_KEY_UPDATE.public_key_source,
                serviceUserPublicKey: "someInvalidKey",
                jwksUrl: ""
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            context: {
                serviceId: TEST_SERVICE_ID
            },
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT,
                id: TEST_SESSION_ID
            },
            query: {
                publicKey: TEST_BAD_PUBLIC_KEY
            },
            path: ".",
            ip: TEST_IP_ADDRESS
        });
        const res = response();

        validateKeySource(mockReq, res, next);

        expect(mockReq.body.authCompliantPublicKey).toBeUndefined();
        expect(res.render).toHaveBeenCalledWith("clients/change-public-key.njk", {
            serviceId: TEST_SERVICE_ID,
            selfServiceClientId: mockReq.params.selfServiceClientId,
            clientId: mockReq.params.clientId,
            errorMessages: {
                serviceUserPublicKey: "Enter a valid public key"
            },
            publicKeySource: TEST_STATIC_KEY_UPDATE.public_key_source,
            serviceUserPublicKey: "someInvalidKey",
            jwksUrl: ""
        });
        expect(next).not.toHaveBeenCalled();
    });
});

describe("Validate and convert submitted JWKS public key", () => {
    it("Call next middleware if public key successfully converted", () => {
        const next = jest.fn();
        const req = request();
        const res = response();

        req.body.jwksUrl = TEST_JWKS_KEY_UPDATE.jwks_uri;
        req.body.publicKeySource = TEST_JWKS_KEY_UPDATE.public_key_source;
        validateKeySource(req, res, next);

        expect(req.body.update.jwks_uri).toEqual(TEST_JWKS_KEY_UPDATE.jwks_uri);
        expect(req.body.update.public_key_source).toEqual(TEST_JWKS_KEY_UPDATE.public_key_source);
        expect(req.body.update.public_key).toEqual(undefined);
        expect(res.render).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalled();
    });

    it("it re-renders with error messages if the public key is invalid", () => {
        const next = jest.fn();
        const req = request({
            body: {
                publicKeySource: TEST_JWKS_KEY_UPDATE.public_key_source,
                serviceUserPublicKey: "",
                jwksUrl: "someInvalidURL"
            },
            context: {
                serviceId: TEST_SERVICE_ID
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            query: {
                publicKey: TEST_STATIC_KEY_UPDATE.public_key
            }
        });
        const res = response();

        validateKeySource(req, res, next);

        expect(res.render).toHaveBeenCalledWith("clients/change-public-key.njk", {
            serviceId: TEST_SERVICE_ID,
            selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
            clientId: TEST_CLIENT_ID,
            errorMessages: {
                jwksUrl: "Enter a valid JWKs URL"
            },
            publicKeySource: TEST_JWKS_KEY_UPDATE.public_key_source,
            serviceUserPublicKey: "",
            jwksUrl: "someInvalidURL"
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("Fail if public key unsuccessfully converted", () => {
        const next = jest.fn();
        const mockReq = request({
            body: {
                publicKeySource: TEST_JWKS_KEY_UPDATE.public_key_source,
                serviceUserPublicKey: "",
                jwksUrl: "someInvalidURL"
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            context: {
                serviceId: TEST_SERVICE_ID
            },
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT,
                id: TEST_SESSION_ID
            },
            query: {
                publicKey: TEST_BAD_PUBLIC_KEY
            },
            path: ".",
            ip: TEST_IP_ADDRESS
        });
        const res = response();

        validateKeySource(mockReq, res, next);

        expect(mockReq.body.authCompliantPublicKey).toBeUndefined();
        expect(res.render).toHaveBeenCalledWith("clients/change-public-key.njk", {
            serviceId: TEST_SERVICE_ID,
            selfServiceClientId: mockReq.params.selfServiceClientId,
            clientId: mockReq.params.clientId,
            errorMessages: {
                jwksUrl: "Enter a valid JWKs URL"
            },
            publicKeySource: TEST_JWKS_KEY_UPDATE.public_key_source,
            serviceUserPublicKey: "",
            jwksUrl: "someInvalidURL"
        });
        expect(next).not.toHaveBeenCalled();
    });
});
