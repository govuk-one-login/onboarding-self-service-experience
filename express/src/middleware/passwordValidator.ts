import {NextFunction, Request, Response} from "express";
import {SelfServiceError} from "../lib/SelfServiceError";

type MiddlewareFunction<T, U, V> = (T: Request, U: Response, V: NextFunction) => void;

export function passwordValidator(render: string, isLogIn: boolean): MiddlewareFunction<Request, Response, NextFunction> {
    return async (req: Request, res: Response, next: NextFunction) => {
        let password: string = req.body["password"];
        password = password.trim();

        if (password === "") {
            throw new SelfServiceError("No password entered", {
                template: render,
                errorMessages: {password: "Enter a password"}
            });
        }

        if (password.length < 8) {
            throw new SelfServiceError("Password was too short", {
                template: render,
                values: {password: password},
                errorMessages: {password: "Your password must be 8 characters or more"}
            });
        }
        next();
    };
}
