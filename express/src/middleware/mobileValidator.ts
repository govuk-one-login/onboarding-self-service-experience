import {NextFunction, Request, Response} from "express";

export function mobileValidator(req: Request, res: Response, next: NextFunction) {
    // remove whitespace
    // ensure UK mobile
    // convert to internation format

    // modify req.body.telephone
    let errorMessages = new Map<string, string>();
    let values = new Map<string, string>();
    if(true) {
        next();
    } else {
        res.render('/create-account/get-email.njk', {fieldOrder: ['telephone'], values: values, errorMessages: errorMessages})
    }
}