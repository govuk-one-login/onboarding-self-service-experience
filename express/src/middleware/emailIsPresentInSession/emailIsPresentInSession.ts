import {NextFunction, Request, Response} from "express";
import {RenderOptions, SelfServiceErrors} from "../../lib/errors";

type MiddlewareFunction<T, U, V> = (T: Request, U: Response, V: NextFunction) => void;

export default function emailIsPresentInSession(
    template: string,
    renderOptions: RenderOptions
): MiddlewareFunction<Request, Response, NextFunction> {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (req.session.emailAddress) {
            next();
        } else {
            throw SelfServiceErrors.Render(template, "", renderOptions);
        }
    };
}
