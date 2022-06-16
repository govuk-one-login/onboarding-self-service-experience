import express, {Request, Response} from "express";
import LambdaFacadeInterface from "../lib/lambda-facade/LambdaFacadeInterface";
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

export const showSignInFormEmail = async function(req: Request, res: Response) {
    if (req.session.emailAddress) {
        res.render('sign-in.njk', { emailAddress: req.session.emailAddress });
    } else {
        res.render('sign-in.njk');
    }
}

export const processEmailAddress = async function (req: Request, res: Response) {
    res.redirect('/sign-in-password');
}

export const showSignInFormPassword = async function(req: Request, res: Response) {
    if (req.session.emailAddress) {
        res.render('sign-in-password.njk');
    } else {
        res.redirect('/sign-in');
    }
}

export const processSignInForm = async function(req: Request, res: Response) {
    let email;
    if (req.session.emailAddress) {
        email = req.session.emailAddress;
    } else {
        email = "There is no email"
    }
    let password = req.body.password;

    const cognitoClient: CognitoInterface = req.app.get('cognitoClient');
    let response: AdminInitiateAuthCommandOutput;
    try {
         response = await cognitoClient.login(email, password);
    } catch (error) {
        if(error instanceof NotAuthorizedException) {
            res.render('there-is-a-problem.njk');
            return;
        }
        throw error;
    }

    req.session.authenticationResult = response.AuthenticationResult;
    req.session.emailAddress = email;

    const payload = (req.session.authenticationResult?.IdToken as string).split('.');
    const claims = Buffer.from(payload[1], 'base64').toString('utf-8');
    const cognitoId = JSON.parse(claims)["cognito:username"];

    const lambdaFacade : LambdaFacadeInterface = req.app.get("lambdaFacade");
    console.log(cognitoId)
    req.session.selfServiceUser = (await lambdaFacade.getUserByCognitoId(`cognito_username#${cognitoId}`, response?.AuthenticationResult?.AccessToken as string)).data.Items[0]
    console.log(req.session.selfServiceUser as User);
    res.redirect('/add-service-name');
    return;

}
