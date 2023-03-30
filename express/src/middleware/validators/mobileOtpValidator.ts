import {Request, RequestHandler} from "express";
import {obscureNumber} from "../../lib/mobileNumberUtils";
import {validateSecurityCode} from "../../lib/validators/checkOtp";

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
            res.render("common/check-mobile.njk", {
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
    if (req.session?.mfaResponse?.codeSentTo) {
        return req.session.mfaResponse.codeSentTo;
    } else {
        return (req.session.enteredMobileNumber as string) || (req.session.mobileNumber as string);
    }
}
