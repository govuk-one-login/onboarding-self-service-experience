import {NextFunction, Request, Response} from "express";
type MiddlewareFunction<T, U, V> = (T: Request, U: Response, V: NextFunction) => void;

export function passwordValidator(render: string, isLogIn: boolean): MiddlewareFunction<Request, Response, NextFunction> {
    return async (req: Request, res: Response, next: NextFunction) => {
        let password: string = req.body["password"];
        password = password.trim();

        if (password === "") {
            res.render(render, {
                errorMessages: {
                    password: "Enter a password"
                }
            });
            return;
        }

        if (password.length < 8) {
            res.render(render, {
                values: {password: password},
                errorMessages: {password: "Your password must be 8 characters or more"}
            });
            return;
        }
        next();
    };
}
