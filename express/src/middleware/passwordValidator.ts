import {NextFunction, Request, Response} from "express";

export async function passwordValidator(req: Request, res: Response, next: NextFunction) {
    let password: string = req.body['create-password-1'];
    password = password.trim();
    if (!eightDigitsMinimum(password)) {
        await errorResponse(password, res, 'password', 'Your password must be at least 8 characters long');
        return;
    }
    next();
}

export function errorResponse(password: string, res: Response, key: string, message: string) {
    const errorMessages = new Map<string, string>();
    const value : object = {password: password};
    errorMessages.set(key, message);
    res.render('create-account/new-password.njk', {
        errorMessages: errorMessages,
        value: value
    });
}

export function eightDigitsMinimum(password: string) {
    return /^.{8,}$/.test(password);
}
