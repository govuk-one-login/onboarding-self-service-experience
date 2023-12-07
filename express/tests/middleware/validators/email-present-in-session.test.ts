import "config/session-data";
import {Request} from "express";
import checkEmailIsPresentInSession from "../../../src/middleware/validators/email-present-in-session";
import {request, response} from "../../mocks";

let req: Request;

const next = jest.fn();
const res = response();
const validator = checkEmailIsPresentInSession("template.njk", {});

describe("Checks whether email is present in the session", () => {
    beforeEach(() => {
        req = request();
    });

    it("Call next middleware if email is present in the session", () => {
        req.session.emailAddress = "testing@test.gov.uk";
        validator(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.render).not.toHaveBeenCalled();
    });

    it("Render errors if email is not present in the session", () => {
        req.session.emailAddress = undefined;
        validator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.render).toHaveBeenCalledWith("template.njk", {});
    });
});
