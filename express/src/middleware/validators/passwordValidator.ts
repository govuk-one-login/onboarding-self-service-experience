import {NextFunction, Request, Response} from "express";
import {validatePassword} from "../../lib/validators/passwordValidator";
import {validationResult} from "../../lib/validators/validationResult";

type MiddlewareFunction<T, U, V> = (T: Request, U: Response, V: NextFunction) => void;

export function passwordValidator(render: string): MiddlewareFunction<Request, Response, NextFunction> {
    return async (req: Request, res: Response, next: NextFunction) => {
        const result: validationResult = validatePassword(req.body["password"]);
        if (result.isValid) {
            next();
        } else {
            res.render(render, {
                values: {password: req.body["password"]},
                errorMessages: {password: result.errorMessage}
            });
            return;
        }
    };
}
