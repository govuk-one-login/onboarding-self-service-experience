import {Request} from "express";
import validateMobileSecurityCode from "middleware/validators/mobile-code-validator";
import {request, response} from "../../mocks";

let req: Request;

const next = jest.fn();
const res = response();

describe("Validate submitted mobile security code", () => {
    beforeEach(() => {
        req = request({session: {enteredMobileNumber: "07000000000"}});
    });

    it("Call next middleware if the security code is valid", () => {
        req.body.securityCode = "123456";
        validateMobileSecurityCode("/get-another-message")(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.render).not.toHaveBeenCalled();
    });

    it("Render errors if the security code is not valid", () => {
        req.body.securityCode = "123";
        validateMobileSecurityCode("/get-another-message", false)(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.render).toHaveBeenCalledWith("common/enter-text-code.njk", {
            errorMessages: {
                securityCode: "Enter the security code using only 6 digits"
            },
            values: {
                securityCode: "123",
                mobileNumber: "07000000000",
                textMessageNotReceivedUrl: "/get-another-message"
            }
        });
    });
});
