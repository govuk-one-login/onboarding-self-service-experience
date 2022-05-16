import {NextFunction, Request, Response} from "express";

const fs = require('fs/promises')
const path = require('path')
import { rfc822EmailValidator } from "./rfc822-validate/validator";


export async function emailValidator(req: Request, res: Response, next: NextFunction) {
    let emailAddress: string = req.body.emailAddress;
    rfc822EmailValidator(emailAddress);

    emailAddress = emailAddress.trim();
    if (emailAddress === "" || emailAddress === undefined || emailAddress === null) {
        await errorResponse(req, res, 'emailAddress', 'Please ensure that all fields have been filled.');
        return;
    }

    if (!rfc822EmailValidator(emailAddress)) { // temporary
        await errorResponse(req, res, 'emailAddress', 'Please check your email is formatted correctly.');
        return;
    }

    if(! await checkEmailDomain(req, res, next, emailAddress) ) {
        await errorResponse(req, res, 'emailAddress', 'Please ensuret that you are using a .gov.uk email address.');
        return;
    }

    next();
}


async function errorResponse(req: Request, res: Response, key: string, message: string) {
    const errorMessages = new Map<string, string>();
    const values = new Map<string, string>();
    errorMessages.set(key, message);
    values.set('emailAddress', req.body.emailAddress);
    res.render('create-account/get-email.njk', {
        errorMessages: errorMessages,
        values: values,
        fieldOrder: ['emailAddress']
    });
}

async function  checkEmailDomain(req: Request, res: Response, next: NextFunction, emailAddress: string): Promise<boolean> {
    // get domains from file
    const p = path.join(__dirname, 'valid-email-domains.txt')
    const data = await fs.readFile(p, {
        encoding: 'utf8'
    })

    const validEmailDomains = data.split('\n')
    return validEmailDomains.filter((domain: string) => emailAddress.endsWith(domain)).length > 0;
}