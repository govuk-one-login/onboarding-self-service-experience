import {NextFunction, Request, Response} from "express";
import {SelfServiceErrors} from "../lib/errors";

type MiddlewareFunction<T, U, V> = (T: Request, U: Response, V: NextFunction) => void;

export function passwordValidator(render: string, isLogIn: boolean): MiddlewareFunction<Request, Response, NextFunction> {
    return async (req: Request, res: Response, next: NextFunction) => {
        let password: string = req.body["password"];
        password = password.trim();

        if (password === "") {
            throw SelfServiceErrors.Render(render, "No password entered", {
                errorMessages: {password: "Enter a password"}
            });
        }

        if (password.length < 8) {
            throw SelfServiceErrors.Render(render, "Password was too short", {
                values: {password: password},
                errorMessages: {password: "Your password must be 8 characters or more"}
            });
        }
        next();
    };
}
