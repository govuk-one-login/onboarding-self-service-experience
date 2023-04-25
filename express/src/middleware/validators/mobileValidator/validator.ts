import {RequestHandler} from "express";
import {validate} from "../../../lib/mobileNumberUtils";

export default function validateMobileNumber(template: string): RequestHandler {
    return (req, res, next) => {
        const validationResult = validate(req.body.mobileNumber);

        if (validationResult.isValid) {
            return next();
        }

        res.render(template, {
            values: {
                mobileNumber: req.body.mobileNumber
            },
            errorMessages: {
                mobileNumber: validationResult.errorMessage
            }
        });
    };
}
