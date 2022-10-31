import {NextFunction, Request, Response} from "express";

type MiddlewareFunction<T, U, V> = (T: Request, U: Response, V: NextFunction) => void;

export default function emailIsPresentInSession(
    template: string,
    renderOptions: {
        values?: {[name: string]: string};
        errorMessages?: {[name: string]: string};
    }
): MiddlewareFunction<Request, Response, NextFunction> {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (req.session.emailAddress) {
            next();
        } else {
            res.render(template, renderOptions);
            return;
        }
    };
}
