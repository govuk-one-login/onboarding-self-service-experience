import {Request, RequestHandler} from "express";
import {obscureNumber} from "../../lib/mobile-number";
import validate from "../../lib/validators/security-code-validator";
import {getFixedOTPCredentialSMSCode, isPseudonymisedFixedOTPCredential} from "../../lib/fixedOTP";

export default function validateMobileSecurityCode(textMessageNotReceivedUrl: string, hideNumber = true): RequestHandler {
    console.info("In validateMobileSecurityCode()");

    return (req, res, next) => {
        let securityCode: string = req.body.securityCode.trim();

        if (isPseudonymisedFixedOTPCredential(securityCode)) {
            securityCode = getFixedOTPCredentialSMSCode(securityCode);
        }

        const result = validate(securityCode);

        if (result.isValid) {
            return next();
        }

        res.render("common/enter-text-code.njk", {
            values: {
                securityCode: req.body.securityCode.trim(),
                mobileNumber: hideNumber ? obscureNumber(getMobileNumber(req)) : req.session.enteredMobileNumber,
                textMessageNotReceivedUrl: textMessageNotReceivedUrl
            },
            errorMessages: {
                securityCode: result.errorMessage
            }
        });
    };
}

function getMobileNumber(req: Request): string {
    console.info("In getMobileNumber()");

    return nonNull(req.session.mfaResponse?.codeSentTo ?? req.session.enteredMobileNumber ?? req.session.mobileNumber);
}
