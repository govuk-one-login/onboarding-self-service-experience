import {NextFunction, Request, Response} from "express";

const fs = require('fs/promises')
const path = require('path')
import { rfc822EmailValidator } from "./rfc822-validate/validator";


export async function emailValidator(req: Request, res: Response, next: NextFunction) {
    let emailAddress: string = req.body.emailAddress;
    rfc822EmailValidator(emailAddress);

    emailAddress = emailAddress.trim();
    if (emailAddress === "" || emailAddress === undefined || emailAddress === null) {
        await errorResponse(emailAddress, res, 'emailAddress', 'Please ensure that all fields have been filled in correctly.');
        return;
    }

    if (!rfc822EmailValidator(emailAddress)) { // temporary
        await errorResponse(emailAddress, res, 'emailAddress', 'Please check that your email is formatted correctly.');
        return;
    }

    if(! await checkEmailDomain( emailAddress) ) {
        await errorResponse(emailAddress, res, 'emailAddress', 'Please ensure that you are using a .gov.uk email address.');
        return;
    }

    next();
}

export async function errorResponse(emailAddress: string, res: Response, key: string, message: string) {
    const errorMessages = new Map<string, string>();
    const values = new Map<string, string>();
    try{
        errorMessages.set(key, message);
        values.set('emailAddress', emailAddress);
        res.render('create-account/get-email.njk', {
            errorMessages: errorMessages,
            values: values,
            fieldOrder: ['emailAddress']
        });
    }catch (e) {
        console.log(e)
    }
}

export async function  checkEmailDomain( emailAddress: string ): Promise<boolean> {
    try{
        const p = path.join(__dirname, 'valid-email-domains.txt')
        const data = await fs.readFile(p, {
            encoding: 'utf8'
        })
        const validEmailDomains = data.split('\n')
        return validEmailDomains.filter((domain: string) => emailAddress.endsWith(domain)).length > 0;
    }catch (e) {
        console.log(e)
    }
    return false;
}