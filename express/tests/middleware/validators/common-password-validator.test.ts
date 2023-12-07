import {Request} from "express";
import checkPasswordAllowed from "../../../src/middleware/validators/common-password-validator";
import {request, response} from "../../mocks";

jest.mock("fs/promises", () => {
    return {
        readFile: jest.fn(() => "common-password")
    };
});

let req: Request;

const next = jest.fn();
const res = response();
const validator = checkPasswordAllowed("template.njk");

describe("Validate submitted password against commonly used list", () => {
    beforeEach(() => {
        req = request();
    });

    it("Render errors if password is not allowed", async () => {
        req.body.password = "common-password";
        await validator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.render).toHaveBeenCalledWith("template.njk", expect.objectContaining({errorMessages: {password: expect.any(String)}}));
    });

    it("Call next middleware if password is allowed", async () => {
        req.body.password = "not-common-password";
        await validator(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.render).not.toHaveBeenCalled();
    });
});
