import {NextFunction, Request, Response} from "express";
import {validateSecurityCode} from "../../lib/validators/checkOtp";
import {validationResult} from "../../lib/validators/validationResult";

export async function emailSecurityCodeValidator(req: Request, res: Response, next: NextFunction) {
    const securityCode = req.body.securityCode.replace(/\s+/g, "");

    const result: validationResult = validateSecurityCode(securityCode);

    if (result.isValid) {
        next();
    } else {
        res.render("create-account/check-email.njk", {
            values: {
                emailAddress: req.session.emailAddress as string,
                securityCode: securityCode
            },
            errorMessages: {
                securityCode: result.errorMessage
            }
        });
    }
}
