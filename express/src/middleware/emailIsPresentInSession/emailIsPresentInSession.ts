import {NextFunction, Request, Response} from "express";
import {ErrorOptions, SelfServiceError} from "../../lib/SelfServiceError";

type MiddlewareFunction<T, U, V> = (T: Request, U: Response, V: NextFunction) => void;

export default function emailIsPresentInSession(errorOptions: ErrorOptions): MiddlewareFunction<Request, Response, NextFunction> {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (req.session.emailAddress) {
            next();
        } else {
            throw new SelfServiceError(`Email address not present in session.\n${req.path}`, errorOptions);
        }
    };
}
