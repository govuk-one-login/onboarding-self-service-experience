import {NextFunction, Request, Response} from "express";
import {isValidOrThrow, prepareForCognito} from "./checkNumber";

type MiddlewareFunction<T, U, V> = (T: Request, U: Response, V: NextFunction) => void;

export default function validateAndConvertForCognito(template: string): MiddlewareFunction<Request, Response, NextFunction> {
    return async (req: Request, res: Response, next: NextFunction) => {
        isValidOrThrow(req.body.mobileNumber, template);
        req.body.mobileNumber = prepareForCognito(req.body.mobileNumber);
        req.session.enteredMobileNumber = req.body.mobileNumber;
        req.session.mobileNumber = req.body.mobileNumber;
        next();
    };
}
