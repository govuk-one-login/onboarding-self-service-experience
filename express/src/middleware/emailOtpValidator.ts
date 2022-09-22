import {NextFunction, Request, Response} from "express";
import {SelfServiceErrors} from "../lib/errors";

export async function emailOtpValidator(req: Request, res: Response, next: NextFunction) {
    const sixDigitsPattern = /^[0-9]{6}$/;
    const otpToTest = req.body["create-email-otp"].trim();

    if (otpToTest === "") {
        next(
            SelfServiceErrors.Render("create-account/check-email.njk", "", {
                values: {
                    emailAddress: req.session.emailAddress as string,
                    otp: otpToTest
                },
                errorMessages: {
                    "create-email-otp": "Enter the security code"
                }
            })
        );
    }

    if (!sixDigitsPattern.test(otpToTest)) {
        next(
            SelfServiceErrors.Render("create-account/check-email.njk", "", {
                values: {
                    emailAddress: req.session.emailAddress as string,
                    otp: otpToTest
                },
                errorMessages: {
                    "create-email-otp": "Enter the security code using only 6 digits"
                }
            })
        );
    }

    next();
}
