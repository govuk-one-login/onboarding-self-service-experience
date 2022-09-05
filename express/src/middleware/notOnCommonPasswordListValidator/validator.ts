import {NextFunction, Request, Response} from "express";
import CommonPasswords from "./commonPasswordsSingleton";

const ERROR_MESSAGE = "Enter a stronger password. Do not use very common passwords like ‘password’ or a sequence of numbers.";

type MiddlewareFunction<T, U, V> = (T: Request, U: Response, V: NextFunction) => void;

export default function notOnCommonPasswordListValidator(
    template: string,
    passwordField: string,
    valuesToRender?: string[]
): MiddlewareFunction<Request, Response, NextFunction> {
    return async (req: Request, res: Response, next: NextFunction) => {
        if ((await CommonPasswords).notOnList(req.body[passwordField])) {
            next();
        } else {
            const errors = new Map<string, string>();
            errors.set(passwordField, ERROR_MESSAGE);

            const values: {[fieldName: string]: string} = {};
            if (valuesToRender) {
                valuesToRender.forEach(v => {
                    values[v] = req.body[v];
                });
            }

            res.render(template, {errorMessages: errors, value: values});
            return;
        }
    };
}
