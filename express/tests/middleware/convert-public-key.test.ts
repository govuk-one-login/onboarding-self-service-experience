import convertPublicKeyForAuth from "middleware/convert-public-key";
import {publicKeyCompact, publicKeyWithHeaders} from "../lib/public-key.test";
import {request, response} from "../mocks";

const next = jest.fn();
const req = request();
const res = response();

describe("Validate and convert submitted public key", () => {
    it("Call next middleware if public key successfully converted", () => {
        req.body.serviceUserPublicKey = publicKeyWithHeaders;
        convertPublicKeyForAuth(req, res, next);

        expect(req.body.authCompliantPublicKey).toEqual(publicKeyCompact);
        expect(res.render).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalled();
    });
});
