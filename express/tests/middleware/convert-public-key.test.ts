import convertPublicKeyForAuth from "../../src/middleware/convert-public-key";
import {TEST_CLIENT_ID, TEST_PUBLIC_KEY, TEST_SELF_SERVICE_CLIENT_ID, TEST_SERVICE_ID} from "../constants";
import {publicKeyCompact, publicKeyWithHeaders} from "../lib/public-key.test";
import {request, response} from "../mocks";
import {
    TEST_AUTHENTICATION_RESULT,
    TEST_CLIENT_ID,
    TEST_IP_ADDRESS,
    TEST_SELF_SERVICE_CLIENT_ID,
    TEST_SERVICE_ID,
    TEST_SESSION_ID
} from "../constants";

describe("Validate and convert submitted public key", () => {
    it("Call next middleware if public key successfully converted", () => {
        const next = jest.fn();
        const req = request();
        const res = response();

        req.body.serviceUserPublicKey = publicKeyWithHeaders;
        convertPublicKeyForAuth(req, res, next);

        expect(req.body.authCompliantPublicKey).toEqual(publicKeyCompact);
        expect(res.render).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalled();
    });

    it("it re-renders with error messages if the public key is invalid", () => {
        const next = jest.fn();
        const req = request({
            body: {
                serviceUserPublicKey: "someInvalidKey"
            },
            context: {
                serviceId: TEST_SERVICE_ID
            },
            params: {
                selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
                clientId: TEST_CLIENT_ID
            },
            query: {
                publicKey: TEST_PUBLIC_KEY
            }
        });
        const res = response();

        convertPublicKeyForAuth(req, res, next);

        expect(res.render).toHaveBeenCalledWith("clients/change-public-key.njk", {
            serviceId: TEST_SERVICE_ID,
            selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
            clientId: TEST_CLIENT_ID,
            errorMessages: {
                serviceUserPublicKey: "Enter a valid public key"
            },
            serviceUserPublicKey: TEST_PUBLIC_KEY
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("Fail if public key unsuccessfully converted", () => {
        const mockReq = request({
            body: {
                serviceUserPublicKey: "123"
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
            path: ".",
            ip: TEST_IP_ADDRESS
        });

        convertPublicKeyForAuth(mockReq, res, next);

        expect(mockReq.body.authCompliantPublicKey).toBeUndefined();
        expect(res.render).toHaveBeenCalledWith("clients/change-public-key.njk", {
            serviceId: TEST_SERVICE_ID,
            selfServiceClientId: mockReq.params.selfServiceClientId,
            clientId: mockReq.params.clientId,
            errorMessages: {
                serviceUserPublicKey: "Enter a valid public key"
            },
            serviceUserPublicKey: mockReq.body.authCompliantPublicKey
        });
        expect(next).not.toHaveBeenCalled();
    });
});
