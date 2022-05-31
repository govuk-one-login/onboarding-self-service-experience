import express, {Request, Response} from "express";
import LambdaFacade from "../lib/lambda-facade";
import {
    AuthenticationResultType,
    NotAuthorizedException,
    UsernameExistsException,
    AttributeType,
    AdminInitiateAuthCommandOutput
} from "@aws-sdk/client-cognito-identity-provider";

import {marshall, unmarshall} from "@aws-sdk/util-dynamodb";

import CognitoInterface from "../lib/cognito/CognitoInterface";
import {User} from "../../@types/User";

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

    const cognitoClient: CognitoInterface = req.app.get('cognitoClient');
    let response: AdminInitiateAuthCommandOutput;
    try {
         response = await cognitoClient.login(email, password);
    } catch (error) {
        if(error instanceof NotAuthorizedException) {
            errorMessages.set('email', 'Either your email address or password was wrong');
            res.render('sign-in.njk', { fieldOrder: ['email'], errorMessages: errorMessages, values: values });
            return;
        }
        throw error;
    }

    req.session.authenticationResult = response.AuthenticationResult;
    req.session.emailAddress = email;

    const payload = (req.session.authenticationResult?.IdToken as string).split('.');
    const claims = Buffer.from(payload[1], 'base64').toString('utf-8');
    const cognitoId = JSON.parse(claims)["cognito:username"];

    console.log(cognitoId)
    req.session.selfServiceUser = (await LambdaFacade.getUserByCognitoId(`cognito_username#${cognitoId}`, response?.AuthenticationResult?.AccessToken as string)).data.Items[0]
    console.log(req.session.selfServiceUser as User);
    res.redirect('/add-service-name');
    return;


}
