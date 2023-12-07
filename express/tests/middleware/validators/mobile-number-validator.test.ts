import {Request} from "express";
import validateMobileNumber from "../../../src/middleware/validators/mobile-number-validator";
import {request, response} from "../../mocks";

let req: Request;

const next = jest.fn();
const res = response();
const validator = validateMobileNumber("template.njk");

describe("Validate submitted mobile phone number", () => {
    beforeEach(() => {
        req = request();
    });

    it("Call next middleware if the number is valid", () => {
        req.body.mobileNumber = "07765 387 483";
        validator(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.render).not.toHaveBeenCalled();
    });

    it("Render error if the number is invalid", () => {
        req.body.mobileNumber = "0707 123 456";
        validator(req, res, next);

        expect(next).not.toBeCalled();
        expect(res.render).toHaveBeenCalledWith("template.njk", {
            values: {
                mobileNumber: "0707 123 456"
            },
            errorMessages: {
                mobileNumber: expect.stringMatching(/UK.*number/)
            }
        });
    });
});
