import {RequestHandler} from "express";
import validatePassword from "../../lib/validators/password-validator";
import {validationResult} from "../../lib/validators/validationResult";

export function passwordValidator(render: string): RequestHandler {
    return async (req, res, next) => {
        const result: validationResult = validatePassword(req.body["password"]);
        if (result.isValid) {
            next();
        } else {
            res.render(render, {
                values: {
                    password: req.body["password"]
                },
                errorMessages: {
                    password: result.errorMessage
                }
            });

            return;
        }
    };
}
