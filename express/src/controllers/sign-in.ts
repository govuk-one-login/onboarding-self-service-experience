import {Request, Response} from "express";
import CognitoInterface from "../lib/cognito/CognitoInterface";
import LambdaFacadeInterface from "../lib/lambda-facade/LambdaFacadeInterface";
import {
    AdminInitiateAuthCommandOutput,
    AdminRespondToAuthChallengeCommandOutput,
    CodeMismatchException,
    NotAuthorizedException,
    UserNotFoundException
} from "@aws-sdk/client-cognito-identity-provider";
import 'express-async-errors';
import {SelfServiceError} from "../lib/SelfServiceError";


export const showSignInFormEmail = async function (req: Request, res: Response) {
    if (req.session.emailAddress) {
        res.render('sign-in.njk', {values: {emailAddress: req.session.emailAddress}});
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

    if (!req.session.cognitoUser?.Username || !req.body['sms-otp'] || !req.session.session) {
        res.render('there-is-a-problem.njk');
        return;
    }

    const cognitoClient: CognitoInterface = req.app.get('cognitoClient');
    let response!: AdminRespondToAuthChallengeCommandOutput;
    try {
        response = await cognitoClient.respondToMfaChallenge(req.session.cognitoUser?.Username as string, req.body['sms-otp'], req.session.session as string);
    } catch (error) {
        if (error instanceof CodeMismatchException) {
            const errorMessages: Map<string, string> = new Map<string, string>();
            errorMessages.set('smsOtp', 'The code you entered is not correct or has expired - enter it again or request a new code')
            res.render('common/check-mobile.njk', {
                mobileNumber: req.session.mobileNumber,
                formActionUrl: "/sign-in-otp-mobile",
                errorMessages: errorMessages
            })
            return;
        }
        else {
            throw error;
        }
    }
    req.session.authenticationResult = response.AuthenticationResult;

    const payload = (req.session.authenticationResult?.IdToken as string).split('.');
    const claims = Buffer.from(payload[1], 'base64').toString('utf-8');
    const cognitoId = JSON.parse(claims)["cognito:username"];
    req.session.mobileNumber = JSON.parse(claims)["phone_number"];

    const lambdaFacade: LambdaFacadeInterface = req.app.get("lambdaFacade");
    req.session.selfServiceUser = (await lambdaFacade.getUserByCognitoId(`cognito_username#${cognitoId}`, response?.AuthenticationResult?.AccessToken as string)).data.Items[0]

    if (req.session.selfServiceUser) {
        req.session.isSignedIn = true;
        res.redirect('/account/list-services');
        return;
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
    const email = req.session.emailAddress as string;
    let password = req.body.password;

    const cognitoClient: CognitoInterface = req.app.get('cognitoClient');
    let response: AdminInitiateAuthCommandOutput;
    try {
        response = await cognitoClient.login(email, password);
    } catch (error) {
        if (error instanceof NotAuthorizedException) {
            throw new SelfServiceError("Not authorized exception caught.  Password is probably wrong",
                {
                    template: 'sign-in-password.njk',
                    values: {password: password},
                    errorMessages: {password: 'Password is wrong'}
                }
            )
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

    req.session.cognitoUser = {Username: response.ChallengeParameters?.USER_ID_FOR_SRP as string, $metadata: {}};
    req.session.session = response.Session;
    req.session.mobileNumber = response.ChallengeParameters?.CODE_DELIVERY_DESTINATION;

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
