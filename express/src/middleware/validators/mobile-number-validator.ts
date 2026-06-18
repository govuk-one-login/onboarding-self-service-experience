import {RequestHandler} from "express";
import {validateNumber as validate} from "../../lib/mobile-number";
import {isPseudonymisedFixedOTPCredential, getFixedOTPCredentialMobileNumber} from "../../lib/fixedOTP";
import logger from "express/src/lib/logger";

export default function validateMobileNumber(template: string): RequestHandler {
    logger.debug("In validateMobileNumber()");

    return (req, res, next) => {
        let mobileNumber: string = req.body.mobileNumber;

        if (isPseudonymisedFixedOTPCredential(req.body.mobileNumber)) {
            mobileNumber = getFixedOTPCredentialMobileNumber(req.body.mobileNumber);
        }
        const result = validate(mobileNumber);

        if (result.isValid) {
            logger.debug("*** Validated ***");
            return next();
        }

        logger.debug("*** NOT Validated ***");

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
