import express, {Request, Response} from "express";

import {
    AuthenticationResultType,
    NotAuthorizedException,
    UsernameExistsException,
    AttributeType
} from "@aws-sdk/client-cognito-identity-provider";

export const showSignInForm = async function(req: Request, res: Response) {
    res.render('sign-in.njk', {values: new Map<String, String>(), errorMessages: new Map<String, String>()});
}

export const processSignInForm = async function(req: Request, res: Response) {
    let email = req.body.email;
    let password = req.body.password;
    let errorMessages: Map<String, String> = new Map<String, String>();
    let values = new Map<string, string>(Object.entries(req.body));

    if( email === "" ) {
        errorMessages.set('email', 'You must enter your email address');
    }

    if(password === "" ) {
        errorMessages.set('password', 'You must enter your password');
    }

    console.log(errorMessages);
    if(errorMessages.size != 0) {
        res.render('sign-in.njk', { fieldOrder: ['email', 'password'], errorMessages: errorMessages, values: values });
        return;
    }

    const cognitoClient = req.app.get('cognitoClient');
    try {
        const response = await cognitoClient.login(email, password);
        req.session.authenticationResult = response.AuthenticationResult;
        req.session.emailAddress = email;
        req.session.selfServiceUser = {data: "", email: "", phone: ""}
        res.redirect('/add-service-name');
        return;
    } catch (error) {
        if(error instanceof NotAuthorizedException) {
            errorMessages.set('email', 'Either your email address or password was wrong');
            res.render('sign-in.njk', { fieldOrder: ['email'], errorMessages: errorMessages, values: values });
            return;
        }
        throw error;
    }
}
