import {Request, RequestHandler} from "express";
import {obscureNumber} from "../../lib/mobileNumberUtils";
import validateSecurityCode from "../../lib/validators/checkOtp";

export function mobileSecurityCodeValidator(textMessageNotReceivedUrl: string, hideNumber = true): RequestHandler {
    return async (req, res, next) => {
        const securityCode: string = req.body.securityCode.replace(/\s+/g, "");
        let mobileNumber;

        if (hideNumber) {
            mobileNumber = obscureNumber(getMobileNumber(req));
        } else {
            mobileNumber = String(req.session.enteredMobileNumber);
        }

        const validationResponse = validateSecurityCode(securityCode);
        if (validationResponse.isValid) {
            next();
        } else {
            res.render("common/enter-text-code.njk", {
                values: {
                    securityCode: securityCode,
                    mobileNumber: mobileNumber,
                    textMessageNotReceivedUrl: textMessageNotReceivedUrl
                },
                errorMessages: {
                    securityCode: validationResponse.errorMessage
                }
            });
        }
    };
}

function getMobileNumber(req: Request): string {
    return nonNull(req.session.mfaResponse?.codeSentTo ?? req.session.enteredMobileNumber ?? req.session.mobileNumber);
}
