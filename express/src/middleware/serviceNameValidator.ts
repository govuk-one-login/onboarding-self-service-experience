import {NextFunction, Request, Response} from "express";

export async function serviceNameValidator(req: Request, res: Response, next: NextFunction) {
    let serviceName: string = req.body['serviceName'];
    serviceName = serviceName.trim();
    if (!atLeastOneCharacter(serviceName)) {
        await errorResponse(serviceName, res, 'serviceName', 'Your password must be at least 8 characters long');
        return;
    }
    next();
}

export function errorResponse(serviceName: string, res: Response, key: string, message: string) {
    const errorMessages = new Map<string, string>();
    errorMessages.set(key, message);
    res.render('add-service-name.njk', {
        errorMessages: errorMessages
    });
}

export function atLeastOneCharacter(serviceName: string) {
    return /^.{1,}$/.test(serviceName);
}
