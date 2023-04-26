import "config/session-data";
import {Request} from "express";
import validateEmail from "middleware/validators/email-validator";
import {request, response} from "../../mocks";

let req: Request;

const next = jest.fn();
const res = response();
const validator = validateEmail("template.njk");

describe("Validate submitted email address", () => {
    beforeEach(() => {
        req = request();
    });

    it("Call next middleware if the email address is valid", async () => {
        req.body.emailAddress = "valid@test.gov.uk";
        await validator(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.render).not.toHaveBeenCalled();
    });

    it("Render errors if the email address is not valid", async () => {
        req.body.emailAddress = "nope@test.yahoo.uk";
        await validator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.render).toHaveBeenCalledWith("template.njk", {
            values: {
                emailAddress: req.body.emailAddress
            },
            errorMessages: {
                emailAddress: "Enter a government email address"
            }
        });
    });
});
