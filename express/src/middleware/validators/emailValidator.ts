import {NextFunction, Request, Response} from "express";
import {validateEmail} from "../../lib/validators/emailValidator";
import {validationResult} from "../../lib/validators/validationResult";
type MiddlewareFunction<T, U, V> = (T: Request, U: Response, V: NextFunction) => void;

export function emailValidator(template: string): MiddlewareFunction<Request, Response, NextFunction> {
    return async (req: Request, res: Response, next: NextFunction) => {
        const emailAddress: string = req.body.emailAddress.trim();
        const result: validationResult = await validateEmail(emailAddress);

        if (result.isValid) {
            req.session.emailAddress = emailAddress;
            next();
        } else {
            res.render(template, {errorMessages: {emailAddress: result.errorMessage}});
        }
    };
}
