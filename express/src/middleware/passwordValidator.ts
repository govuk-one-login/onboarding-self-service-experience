import {NextFunction, Request, Response} from "express";

type MiddlewareFunction<T, U, V> = (T: Request, U: Response, V: NextFunction) => void;
export function passwordValidator(render: string, isLogIn: boolean): MiddlewareFunction<Request, Response, NextFunction> {
    return async (req: Request, res: Response, next: NextFunction) =>
    {
        let password: string = req.body['password'];
        password = password.trim();

        if (password === '') {
            await errorResponse(render, password, res, 'password', 'Enter a password');
            return;
        }

        if (!eightDigitsMinimum(password)) {
            await errorResponse(render, password, res, 'password', 'Your password must be 8 characters or more');
            return;
        }
        next();
    }
}

export function errorResponse(render: string, password: string, res: Response, key: string, message: string) {
    const errorMessages = new Map<string, string>();
    const value : object = {password: password};
    errorMessages.set(key, message);
    res.render( render, {
        errorMessages: errorMessages,
        value: value
    });
}

export function eightDigitsMinimum(password: string) {
    return /^.{8,}$/.test(password);
}
