import {NextFunction, Request, Response} from "express";
import validate from "../../lib/validators/checkOtp";

export default function validateEmailSecurityCode(req: Request, res: Response, next: NextFunction) {
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
