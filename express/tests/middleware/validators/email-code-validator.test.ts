import {Request} from "express";
import validator from "../../../src/middleware/validators/email-code-validator";
import {request, response} from "../../mocks";

let req: Request;

const next = jest.fn();
const res = response();

describe("Validate submitted email security code", () => {
    beforeEach(() => {
        req = request();
    });

    it("Call next middleware if the security code is valid", () => {
        req.body.securityCode = "123456";
        validator(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.render).not.toHaveBeenCalled();
    });

    it("Render errors if the security code is not valid", () => {
        req.session.emailAddress = "render-this@test.gov.uk";
        req.body.securityCode = "123";
        validator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.render).toHaveBeenCalledWith("register/enter-email-code.njk", {
            values: {
                emailAddress: "render-this@test.gov.uk",
                securityCode: "123"
            },
            errorMessages: {
                securityCode: "Enter the security code using only 6 digits"
            }
        });
    });
});
