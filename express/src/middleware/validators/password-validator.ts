import {RequestHandler} from "express";
import validate from "../../lib/validators/password-validator";

export default function validatePassword(render: string, passwordField = "password"): RequestHandler {
    console.info("In validatePassword()");

    return (req, res, next) => {
        const result = validate(req.body[passwordField]);

        if (result.isValid) {
            return next();
        }

        res.render(render, {
            values: {
                [passwordField]: req.body[passwordField]
            },
            errorMessages: {
                [passwordField]: result.errorMessage
            }
        });
    };
}
