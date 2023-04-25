import {RequestHandler} from "express";
import validate from "../../lib/validators/password-validator";

export default function validatePassword(render: string): RequestHandler {
    return (req, res, next) => {
        const result = validate(req.body["password"]);

        if (result.isValid) {
            return next();
        }

        res.render(render, {
            values: {
                password: req.body["password"]
            },
            errorMessages: {
                password: result.errorMessage
            }
        });
    };
}
