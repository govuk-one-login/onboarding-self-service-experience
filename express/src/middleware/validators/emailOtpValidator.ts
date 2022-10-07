import {NextFunction, Request, Response} from "express";
import {validateOtp} from "../../lib/validators/checkOtp";
import {validationResult} from "../../lib/validators/validationResult";

export async function emailOtpValidator(req: Request, res: Response, next: NextFunction) {
    const otpToTest = req.body["create-email-otp"].trim();

    const result: validationResult = validateOtp(otpToTest);

    if (result.isValid) {
        next();
    } else {
        res.render("create-account/check-email.njk", {
            values: {
                emailAddress: req.session.emailAddress as string,
                otp: otpToTest
            },
            errorMessages: {
                "create-email-otp": result.errorMessage
            }
        });
    }
}
