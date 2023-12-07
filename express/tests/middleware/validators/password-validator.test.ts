import {Request} from "express";
import validatePassword from "../../../src/middleware/validators/password-validator";
import {request, response} from "../../mocks";

let req: Request;

const next = jest.fn();
const res = response();
const validator = validatePassword("template.njk");

describe("Validate submitted password", () => {
    beforeEach(() => {
        req = request();
    });

    it("Call next middleware if the password is valid", () => {
        req.body.password = "12_character";
        validator(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.render).not.toHaveBeenCalled();
    });

    it("Render errors if the password is invalid", () => {
        req.body.password = "7_chars";
        validator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.render).toHaveBeenCalledWith("template.njk", {
            values: {
                password: "7_chars"
            },
            errorMessages: {
                password: expect.stringContaining("8 characters or more")
            }
        });
    });
});
