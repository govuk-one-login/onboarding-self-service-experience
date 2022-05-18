import {NextFunction, Request, Response} from "express";
import allowedEmailDomains from "../lib/allowedEmailDomains";

import isRfc822Compliant from "../lib/isRfc822Compliant";

export async function emailValidator(req: Request, res: Response, next: NextFunction) {
    let emailAddress: string = req.body.emailAddress;

    emailAddress = emailAddress.trim();

    if (emailAddress === "" || emailAddress === undefined || emailAddress === null) {
        await errorResponse(emailAddress, res, 'emailAddress', 'Please ensure that all fields have been filled in correctly.');
        return;
    }

    if (!isRfc822Compliant(emailAddress)) {
        await errorResponse(emailAddress, res, 'emailAddress', 'Please check that your email is formatted correctly.');
        return;
    }

    if (!await isAllowedDomain(emailAddress)) {
        await errorResponse(emailAddress, res, 'emailAddress', 'Please ensure that you are using a .gov.uk email address.');
        return;
    }

    req.session.emailAddress = emailAddress;
    next();
}

export function errorResponse(emailAddress: string, res: Response, key: string, message: string) {
    const errorMessages = new Map<string, string>();
    const values = new Map<string, string>();
    errorMessages.set(key, message);
    values.set('emailAddress', emailAddress);
    res.render('create-account/get-email.njk', {
        errorMessages: errorMessages,
        values: values,
        fieldOrder: ['emailAddress']
    });
}

export async function isAllowedDomain(emailAddress: string): Promise<boolean> {
    return (await allowedEmailDomains).filter((domain: string) => emailAddress.endsWith(`.${domain}`)).length > 0;
}