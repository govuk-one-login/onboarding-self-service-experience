import {NextFunction, Request, Response} from "express";

export async function emailOtpValidator(req: Request, res: Response, next: NextFunction) {
    const sixDigitsPattern = /^[0-9]{6}$/;
    const otpToTest = req.body["create-email-otp"].trim();

    if (otpToTest === "") {
        res.render("create-account/check-email.njk", {
            values: {
                emailAddress: req.session.emailAddress as string,
                otp: otpToTest
            },
            errorMessages: {
                "create-email-otp": "Enter the security code"
            }
        });
        return;
    }

    if (!sixDigitsPattern.test(otpToTest)) {
        res.render("create-account/check-email.njk", {
            values: {
                emailAddress: req.session.emailAddress as string,
                otp: otpToTest
            },
            errorMessages: {
                "create-email-otp": "Enter the security code using only 6 digits"
            }
        });
        return;
    }

    next();
}
