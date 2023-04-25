import {RequestHandler} from "express";
import validateEmail from "../../lib/validators/emailValidator";
import {validationResult} from "../../lib/validators/validationResult";

export function emailValidator(template: string): RequestHandler {
    return async (req, res, next) => {
        const emailAddress = req.body.emailAddress.trim();
        const result: validationResult = await validateEmail(emailAddress);

        if (result.isValid) {
            req.session.emailAddress = emailAddress;
            next();
        } else {
            res.render(template, {
                values: {
                    emailAddress: emailAddress
                },
                errorMessages: {
                    emailAddress: result.errorMessage
                }
            });
        }
    };
}
