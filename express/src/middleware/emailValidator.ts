import {NextFunction, Request, Response} from "express";
const fs = require('fs/promises')
const path = require('path')

export async function emailValidator(req: Request, res: Response, next: NextFunction) {
    let emailAddress: string = req.body.emailAddress;
    // trim
    emailAddress = emailAddress.trim();

    // error messages response 
    async function  errorResponse(key:string , message:string) {
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

    // check if email address is empty
    if (emailAddress === "") {
        errorResponse('emailAddress', 'You must enter an email address.');
    }
    // check if email address is valid
    

    // check if email address has valid domain
    async function checkEmailDomain(emailAddress: string) {
        // get domains from file
        const p = path.join(__dirname, 'valid-email-domains.txt')
        const data = await fs.readFile(p, {
        encoding: 'utf8'
        })

        const validEmailDomains = data.split('\n')
        for (let i = 0; i < validEmailDomains.length; i++) {
            if (emailAddress.endsWith(validEmailDomains[i])) {
                res.redirect('check-email'); 
                break;
            }
            errorResponse('emailAddress', "Please enter a valid email .gov.uk email address.");
        }
    }
    checkEmailDomain(emailAddress);


    // ensure well-formed
    // correct suffix

    // modify req.body.email

    // if(true) {

    //     req.body.emailAddress = emailAddress;
    //     next();
    // } else {
    //     const errorMessages = new Map<string, string>();
    //     const values = new Map<string, string>();
    //     errorMessages.set("emailAddress", "You must provide a government email address");
    //     values.set('emailAddress', req.body.emailAddress);
    //     res.render('create-account/get-email.njk', {
    //         errorMessages: errorMessages,
    //         values: values,
    //         fieldOrder: ['emailAddress']
    //     });
    // }
}