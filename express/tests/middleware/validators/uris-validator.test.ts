import {Request} from "express";
import validateUris from "middleware/validators/uris-validator";
import {request, response} from "../../mocks";

let req: Request;

const next = jest.fn();
const res = response();
const validator = validateUris("template.njk");

describe("Validate submitted URIs", () => {
    beforeEach(() => {
        req = request({params: {serviceId: "foo", selfServiceClientId: "bar", clientId: "baz"}});
    });

    it("Call next middleware if the URIs are valid", () => {
        req.body.redirectUris = "https://valid.gov.uk/ https://also-valid.gov.uk";
        validator(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.render).not.toHaveBeenCalled();
    });

    it("Render errors if the URIs are not valid", () => {
        req.body.redirectUris = "http://invalid.gov.uk/ http://also-invalid.gov.uk";
        validator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.render).toHaveBeenCalledWith("template.njk", expect.any(Object));
    });
});
