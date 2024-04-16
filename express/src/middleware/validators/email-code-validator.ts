import {NextFunction, Request, Response} from "express";
import validate from "../../lib/validators/security-code-validator";
import {isPseudonymisedFixedOTPCredential, getFixedOTPCredentialSecurityCode} from "../../lib/fixedOTP";

export default function validateEmailSecurityCode(req: Request, res: Response, next: NextFunction) {
    console.info("In validateEmailSecurityCode()");

    if (isPseudonymisedFixedOTPCredential(req.body.securityCode.trim())) {
        req.body.securityCode = getFixedOTPCredentialSecurityCode(req.body.securityCode);
    }

    const securityCode = req.body.securityCode.trim();
    const result = validate(securityCode);

    if (result.isValid) {
        return next();
    }

    res.render("register/enter-email-code.njk", {
        values: {
            emailAddress: req.session.emailAddress,
            securityCode: securityCode
        },
        errorMessages: {
            securityCode: result.errorMessage
        }
    });
}
