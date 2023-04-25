import {RequestHandler} from "express";
import isCommonPassword from "../../lib/commonPasswords/CommonPasswords";

const errorMessage = "Enter a stronger password. Do not use very common passwords like ‘password’ or a sequence of numbers.";

export default function checkPasswordAllowed(template: string, passwordField = "password", valuesToRender = ["password"]): RequestHandler {
    return async (req, res, next) => {
        const isCommon = await isCommonPassword(req.body[passwordField]);

        if (!isCommon) {
            return next();
        }

        res.render(template, {
            values: Object.fromEntries(valuesToRender?.map(field => [field, req.body[field]])),
            errorMessages: {
                [passwordField]: errorMessage
            }
        });
    };
}
