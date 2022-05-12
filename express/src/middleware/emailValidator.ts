import {NextFunction, Request, Response} from "express";

export function emailValidator(req: Request, res: Response, next: NextFunction) {
    let emailAddress: string = req.body.emailAddress;
    // trim
    // ensure well-formed
    // correct suffix

    // modify req.body.email

    if(true) {

        req.body.emailAddress = emailAddress;
        next();
    } else {
        const errorMessages = new Map<string, string>();
        const values = new Map<string, string>();
        errorMessages.set("emailAddress", "You must provide a government email address");
        values.set('emailAddress', req.body.emailAddress);
        res.render('create-account/get-email.njk', {
            errorMessages: errorMessages,
            values: values,
            fieldOrder: ['emailAddress']
        });
    }
}