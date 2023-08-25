import {RequestHandler} from "express";
import validate from "../../lib/validators/email-validator";
import * as console from "console";

export default function validateEmail(template: string): RequestHandler {
    return async (req, res, next) => {
        const emailAddress = req.body.emailAddress.trim();
        const result = await validate(emailAddress);

        if (result.isValid) {
            req.session.emailAddress = emailAddress;
            console.log("Email Validated");
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
