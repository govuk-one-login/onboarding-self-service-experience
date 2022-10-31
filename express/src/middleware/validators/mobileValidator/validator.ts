import {NextFunction, Request, Response} from "express";
import {validate} from "../../../lib/mobileNumberUtils";

type MiddlewareFunction<T, U, V> = (T: Request, U: Response, V: NextFunction) => void;

export default function validateMobileNumber(template: string): MiddlewareFunction<Request, Response, NextFunction> {
    return (req: Request, res: Response, next: NextFunction) => {
        const validationResult = validate(req.body.mobileNumber);
        if (validationResult.isValid) {
            next();
        } else {
            res.render(template, {errorMessages: {mobileNumber: validationResult.errorMessage}});
        }
    };
}
