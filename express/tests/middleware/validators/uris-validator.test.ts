import {Request} from "express";
import validateUri from "../../../src/middleware/validators/uri-validator";
import {request, response} from "../../mocks";

let req: Request;

const next = jest.fn();
const res = response();
const validator = validateUri("template.njk", "redirectUri");

describe("Validate submitted URIs", () => {
    beforeEach(() => {
        req = request({params: {selfServiceClientId: "bar", clientId: "baz"}, context: {serviceId: "foo"}});
    });

    it("Call next middleware if the URIs are valid", () => {
        req.body.redirectUri = "https://valid.gov.uk/";
        validator(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.render).not.toHaveBeenCalled();
    });

    it("Render errors if the URIs are not valid", () => {
        req.body.redirectUri = "http://invalid.gov.uk/";
        validator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.render).toHaveBeenCalledWith("template.njk", expect.any(Object));
    });
});
