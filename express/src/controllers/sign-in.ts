import {Request, Response} from "express";
import LambdaFacadeInterface from "../lib/lambda-facade/LambdaFacadeInterface";
import {AdminInitiateAuthCommandOutput, NotAuthorizedException} from "@aws-sdk/client-cognito-identity-provider";

import CognitoInterface from "../lib/cognito/CognitoInterface";
import {User} from "../../@types/User";

export const showSignInFormEmail = async function(req: Request, res: Response) {
    if (req.session.emailAddress) {
        res.render('sign-in.njk', { emailAddress: req.session.emailAddress });
    } else {
        res.render('sign-in.njk');
    }
}

export const showLoginOtpMobile = async function(req: Request, res: Response) {
    if (req.session.emailAddress) {
        const mobileNumberRaw = String(req.session.mobileNumber);
        const mobileNumberLast4Digits = mobileNumberRaw.slice(-4);
        const mobileNumber = '*******' + mobileNumberLast4Digits;
        res.render('sign-in-otp-mobile.njk', { mobileNumber: mobileNumber });
    } else {
        res.redirect('/sign-in');
    }
}

export const processLoginOtpMobile = async function(req: Request, res: Response) {
    // TO DO add the functionality to process the login mobile otp
    res.redirect('/account/list-services');
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
        if (error instanceof NotAuthorizedException) {
            const errorMessages = new Map<string, string>();
            errorMessages.set('password', 'Password is wrong');
            res.render('sign-in-password.njk', {errorMessages: errorMessages});
            return;
        }
        console.log(error);
        res.render('there-is-a-problem.njk');
        return;
    }

    req.session.authenticationResult = response.AuthenticationResult;
    req.session.emailAddress = email;

    const payload = (req.session.authenticationResult?.IdToken as string).split('.');
    const claims = Buffer.from(payload[1], 'base64').toString('utf-8');
    const cognitoId = JSON.parse(claims)["cognito:username"];
    req.session.mobileNumber = JSON.parse(claims)["phone_number"];

    const lambdaFacade : LambdaFacadeInterface = req.app.get("lambdaFacade");
    console.log(cognitoId)
    req.session.selfServiceUser = (await lambdaFacade.getUserByCognitoId(`cognito_username#${cognitoId}`, response?.AuthenticationResult?.AccessToken as string)).data.Items[0]
    console.log(req.session.selfServiceUser as User);
    res.redirect('/sign-in-otp-mobile');
    return;

}
