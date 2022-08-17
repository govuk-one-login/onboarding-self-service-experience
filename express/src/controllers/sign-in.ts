import {
    AdminInitiateAuthCommandOutput,
    NotAuthorizedException,
    UserNotFoundException
} from "@aws-sdk/client-cognito-identity-provider";
import {Request, Response} from "express";

import CognitoInterface from "../lib/cognito/CognitoInterface";
import LambdaFacadeInterface from "../lib/lambda-facade/LambdaFacadeInterface";

export const showSignInFormEmail = async function (req: Request, res: Response) {
    if (req.session.emailAddress) {
        res.render('sign-in.njk', {emailAddress: req.session.emailAddress});
    } else {
        res.render('sign-in.njk');
    }
}

export const showLoginOtpMobile = async function (req: Request, res: Response) {
    if (req.session.emailAddress) {
        const mobileNumberRaw = String(req.session.mobileNumber);
        const mobileNumberLast4Digits = mobileNumberRaw.slice(-4);
        const mobileNumber = '*******' + mobileNumberLast4Digits;
        res.render('common/check-mobile.njk', {
            mobileNumber: mobileNumber,
            formActionUrl: "/sign-in-otp-mobile",
            active: "sign-in",
            textMessageNotReceivedUrl: "/resend-text-code"

        });
    } else {
        res.redirect('/sign-in');
    }
}

export const processLoginOtpMobile = async function (req: Request, res: Response) {
    // TO DO add the functionality to process the login mobile otp
    if (true) { // because OTP was correct and we've implemented that
        req.session.isSignedIn = true;
        res.redirect('/account/list-services');
    } else {
        res.redirect('/sign-in-otp-mobile');
    }
}

export const processEmailAddress = async function (req: Request, res: Response) {
    res.redirect('/sign-in-password');
}


export const showSignInFormPassword = async function (req: Request, res: Response) {
    if (req.session.emailAddress) {
        res.render('sign-in-password.njk');
    } else {
        res.redirect('/sign-in');
    }
}

export const processSignInForm = async function (req: Request, res: Response) {
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

        if (error instanceof UserNotFoundException) {
            req.session.emailAddress = email;
            res.redirect('/create/get-email')
            return;
        }

        console.error(error);
        res.render('there-is-a-problem.njk');
        return;
    }

    req.session.authenticationResult = response.AuthenticationResult;
    req.session.emailAddress = email;

    const payload = (req.session.authenticationResult?.IdToken as string).split('.');
    const claims = Buffer.from(payload[1], 'base64').toString('utf-8');
    const cognitoId = JSON.parse(claims)["cognito:username"];
    req.session.mobileNumber = JSON.parse(claims)["phone_number"];

    const lambdaFacade: LambdaFacadeInterface = req.app.get("lambdaFacade");
    req.session.selfServiceUser = (await lambdaFacade.getUserByCognitoId(`cognito_username#${cognitoId}`, response?.AuthenticationResult?.AccessToken as string)).data.Items[0]
    res.redirect('/sign-in-otp-mobile');
    return;
}

export const signOut = async function (req: Request, res: Response) {
    req.session.destroy(() => res.redirect('/'));
}

export const showResendPhoneCodeForm = async function (req: Request, res: Response) {
    let accessToken: string | undefined = req.session.authenticationResult?.AccessToken;
    if (accessToken === undefined) {
        // user must login before we can process their mobile number
        res.redirect('/sign-in')
        return;
    }
    res.render('resend-phone-code-sign-in.njk');
}

export const resendMobileVerificationCode  = async function (req: Request, res: Response) {
    req.body.mobileNumber = req.session.mobileNumber;
    await processEnterMobileForm(req, res);
}

export const processEnterMobileForm = async function (req: Request, res: Response) {
    // The user needs to be logged in for this
    let accessToken: string | undefined = req.session.authenticationResult?.AccessToken;
    if (accessToken === undefined) {
        // user must login before we can process their mobile number
        res.redirect('/sign-in')
        return;
    }

    let mobileNumber: string | undefined = req.session.mobileNumber;
    const cognitoClient = await req.app.get('cognitoClient');
    // Not sure that we need this here ....
    if (mobileNumber === undefined) {
        res.render('there-is-a-problem.njk');
    }

    // @ts-ignore
    let response = await cognitoClient.setPhoneNumber(req.session.emailAddress, mobileNumber);

    // presumably that was fine so let's try to veerify the number

    let codeSent = await cognitoClient.sendMobileNumberVerificationCode(accessToken);
    console.debug("VERIFICATION CODE RESPONSE");
    console.debug(codeSent);
    req.session.mobileNumber = mobileNumber;


    const mobileNumberRaw = req.body.mobileNumber;
    const mobileNumberLast4Digits = mobileNumberRaw.slice(-4);
    const mobileNumberFormatted = '*******' + mobileNumberLast4Digits;

    res.render('common/check-mobile.njk', {
        mobileNumber: mobileNumberFormatted,
        formActionUrl: "/sign-in-otp-mobile",
        textMessageNotReceivedUrl: "/resend-text-code",
        active: "sign-in",
    });
}
