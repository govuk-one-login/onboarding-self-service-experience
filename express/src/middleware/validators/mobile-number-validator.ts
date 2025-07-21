import {RequestHandler} from "express";
import {validateNumber as validate} from "../../lib/mobile-number";
import {isPseudonymisedFixedOTPCredential, getFixedOTPCredentialMobileNumber} from "../../lib/fixedOTP";

export default function validateMobileNumber(template: string): RequestHandler {
    console.info("In validateMobileNumber()");

    return (req, res, next) => {
        let mobileNumber: string = req.body.mobileNumber;

        if (isPseudonymisedFixedOTPCredential(req.body.mobileNumber)) {
            mobileNumber = getFixedOTPCredentialMobileNumber(req.body.mobileNumber);
        }
        const result = validate(mobileNumber);

        if (result.isValid) {
            console.log("*** Validated ***");
            return next();
        }

        console.log("*** NOT Validated ***");

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
