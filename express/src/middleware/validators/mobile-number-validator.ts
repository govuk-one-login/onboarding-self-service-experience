import {RequestHandler} from "express";
import {validateNumber as validate} from "../../lib/mobile-number";

export default function validateMobileNumber(template: string): RequestHandler {
    console.info("In validateMobileNumber()");

    return (req, res, next) => {
        const result = validate(req.body.mobileNumber);

        if (result.isValid) {
            return next();
        }

        res.render(template, {
            values: {
                mobileNumber: req.body.mobileNumber
            },
            errorMessages: {
                mobileNumber: result.errorMessage
            }
        });
    };
}
