import express, {Request, Response} from "express";
import {CognitoClient} from '../lib/cognito'

export const showGetEmailForm = function(req: Request, res: Response) {
    res.render('create-account/get-email.njk');
}

export const processGetEmailForm = async function(req: Request, res: Response) {
    const emailAddress: string = req.body.emailAddress;
    const validEmail = emailAddress.endsWith(".gov.uk");
    const cognitoClient = await req.app.get('cognitoClient');

    if(validEmail) {
        req.session.emailAddress = emailAddress;
        let result: any;
        try {
            result = await cognitoClient.createUser(emailAddress);
        } catch (error) {
            console.error(error);
            res.redirect("/create/get-email");
        }

        res.redirect('check-email');
    } else {
        const errorMessages = new Map<string, string>();
        const values = new Map<string, string>();
        errorMessages.set("emailAddress", "You must provide a government email address");
        values.set('emailAddress', emailAddress);
        res.render('create-account/get-email.njk', {errorMessages: errorMessages, values: values, fieldOrder: ['emailAddress']});
    }
}

export const showCheckEmailForm = function(req: Request, res: Response) {
    if(!req.session.emailAddress) {
        console.error("No email address in session so we can't tell the user to check their email");
        res.redirect("/");
    } else {
        res.render('create-account/check-email.njk', {emailAddress: req.session.emailAddress})
    }
}

export const showNewPasswordForm = async function(req: Request, res: Response) {
    const cognitoClient = await req.app.get('cognitoClient');

    if(!req.session.emailAddress || !req.body['create-email-otp']) {
        res.redirect('get-email')
        return;
    }
    const user = await cognitoClient.login(req.session.emailAddress as string, req.body['create-email-otp']);
    req.session.session = user.Session;
    res.render('create-account/new-password.njk');
}

export const updatePassword = async function(req: Request, res: Response) {
    const cognitoClient = await req.app.get('cognitoClient');

    console.log(req.body)
    const user = await cognitoClient.setNewPassword(req.session.emailAddress as string, req.body['create-password-1'], req.session.session as string);
    console.log(user);
}
