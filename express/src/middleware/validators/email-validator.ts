import {RequestHandler} from "express";
import validate from "../../lib/validators/email-validator";

export default function validateEmail(template: string): RequestHandler {
    console.info("In validateEmail()");

    return async (req, res, next) => {
        const emailAddress = req.body.emailAddress.trim();
        const result = await validate(emailAddress);

        if (result.isValid) {
            req.session.emailAddress = emailAddress;
            return next();
        }

        res.render(template, {
            values: {
                emailAddress: emailAddress
            },
            errorMessages: {
                emailAddress: result.errorMessage
            }
        });
    };
}
