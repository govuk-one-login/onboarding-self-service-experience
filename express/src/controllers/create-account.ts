import {NextFunction, Request, Response} from "express";
import {
    AdminUpdateUserAttributesCommandOutput,
    AttributeType, CodeMismatchException,
    NotAuthorizedException,
    UsernameExistsException
} from "@aws-sdk/client-cognito-identity-provider";
import CognitoInterface from "../lib/cognito/CognitoInterface";
import lambdaFacadeInstance from "../lib/lambda-facade";
import {randomUUID} from "crypto";

export const showGetEmailForm = function (req: Request, res: Response) {
    res.render('create-account/get-email.njk');
}

export const processGetEmailForm = async function (req: Request, res: Response) {
    const emailAddress: string = req.body.emailAddress;
    const cognitoClient: CognitoInterface = await req.app.get('cognitoClient');

    req.session.emailAddress = emailAddress;
    let result: any;
    try {
        result = await cognitoClient.createUser(emailAddress);
        console.debug(result);
    } catch (error) {
        if (error instanceof UsernameExistsException) {
            // Actually, we should check whether they've verified their email
            // If not, we should redirect them to the verify email page and tell them to check their email
            // That page should offer the chance to send a new code to their email address
            const errorMessages = new Map<string, string>();
            const values = new Map<string, string>();
            errorMessages.set('emailAddress', `${emailAddress} has already been registered.`);
            values.set('emailAddress', emailAddress);
            res.render('create-account/get-email.njk', {
                values: values,
                errorMessages: errorMessages,
                fieldOrder: ['emailAddress']
            });
            return;
        }
        res.redirect("/create/get-email");
        return;
    }
    res.redirect('check-email'); // this is really a something went wrong moment and there must be other cases for us to try in particular - bad co
}

export const showCheckEmailForm = function (req: Request, res: Response) {
    if (!req.session.emailAddress) {
        console.error("No email address in session so we can't tell the user to check their email");
        res.redirect("/");
    } else {
        res.render('create-account/check-email.njk', {emailAddress: req.session.emailAddress});
    }
}

export const checkEmailOtp = async function (req: Request, res: Response) {
    const cognitoClient = await req.app.get('cognitoClient');

    if (!req.session.emailAddress) {
        res.redirect('get-email');
        return;
    }

    if (req.body['create-email-otp'] === "") {
        console.log("No password entered");
        let fieldOrder = ['create-email-otp'];
        const errorMessages = new Map<string, string>();
        errorMessages.set('create-email-otp', "You must enter the password we emailed you.")
        res.render('create-account/check-email.njk', {
            emailAddress: req.session.emailAddress,
            errorMessages: errorMessages,
            fieldOrder: fieldOrder
        });
        return;
    }


    try {
        const response = await cognitoClient.login(req.session.emailAddress as string, req.body['create-email-otp']);
        req.session.session = response.Session;
        res.redirect('/create/update-password');
        return;
    } catch (error) {
        if (error instanceof NotAuthorizedException) {
            // show the form again with an error message though
            console.log("Showing them the check-email form again")
            res.render('create-account/check-email.njk', {emailAddress: req.session.emailAddress});

        }
    }
}

export const showNewPasswordForm = async function (req: Request, res: Response, next: NextFunction) {
    console.log("Show new password")
    if (req.session.session !== undefined) {
        res.render('create-account/new-password.njk');
        return;
    } else {
        // this flow needs designing
        res.redirect('/sign-in');
    }
}

export const updatePassword = async function (req: Request, res: Response, next: NextFunction) {
    const cognitoClient: CognitoInterface = await req.app.get('cognitoClient');

    const response = await cognitoClient.setNewPassword(req.session.emailAddress as string, req.body['create-password-1'], req.session.session as string);
    req.session.session = response.Session;
    req.session.authenticationResult = response.AuthenticationResult;

    let user = await cognitoClient.getUser(req.session.emailAddress as string);
    // do something better with this
    req.session.cognitoUser = user;
    let email: string | undefined;

    if (user.UserAttributes) {
        email = user.UserAttributes.filter((attribute: AttributeType) => attribute.Name === 'email')[0].Value;
    }

    let updateResponse: AdminUpdateUserAttributesCommandOutput;
    if (email === undefined) {
        next(); // Who knows what could have gone wrong?
    } else {
        await cognitoClient.setEmailAsVerified(email);
    }

    res.redirect('/create/enter-mobile');
}

export const showEnterMobileForm = async function (req: Request, res: Response) {
    let accessToken: string | undefined = req.session.authenticationResult?.AccessToken;
    if (accessToken === undefined) {
        // user must login before we can process their mobile number
        res.redirect('/login')
        return;
    }
    res.render('create-account/enter-mobile.njk');
}

export const processEnterMobileForm = async function (req: Request, res: Response) {
    // The user needs to be logged in for this
    let accessToken: string | undefined = req.session.authenticationResult?.AccessToken;
    if (accessToken === undefined) {
        // user must login before we can process their mobile number
        res.redirect('/sign-in')
        return;
    }

    let mobileNumber: string = req.body.mobileNumber;
    const cognitoClient = await req.app.get('cognitoClient');
    if (mobileNumber === undefined) {
        res.render('create-account/enter-mobile.njk');
    }
    let response = await cognitoClient.setPhoneNumber(req.session.emailAddress, mobileNumber);
    console.log(response);

    // presumably that was fine so let's try to veerify the number

    let codeSent = await cognitoClient.sendMobileNumberVerificationCode(accessToken);
    console.debug("VERIFICATION CODE RESPONSE");
    console.debug(codeSent);
    req.session.mobileNumber = mobileNumber;
    res.render('create-account/check-mobile.njk', {mobileNumber: mobileNumber});
}

export const submitMobileVerificationCode = async function (req: Request, res: Response) {
    // need to check for access token in middleware
    if(req.session.authenticationResult?.AccessToken === undefined) {
        res.redirect('/sign-in');
        return;
    }
    const cognitoClient = await req.app.get('cognitoClient');
    let otp = req.body['create-sms-otp'];
    if (otp === undefined) {
        res.render('create-account/check-mobile.njk', {mobileNumber: req.session.mobileNumber});
        return;
    }
    try {
        let response = await cognitoClient.verifySmsCode(req.session.authenticationResult?.AccessToken, otp);
        console.log("Got SMS Verification code response")
        console.log(response);

        const uuid = randomUUID();
        const email = req.session.cognitoUser?.UserAttributes?.filter((attribute: AttributeType) => attribute.Name === 'email')[0].Value;
        const phone = req.session.mobileNumber;

        let user = {
                "pk": `user#${uuid}`,
                "sk": `cognito_username#${req.session.cognitoUser?.Username}`,
                "data": "we haven't collected this full name",
                first_name: "we haven't collected this first name",
                last_name: "we haven't collected this last name",
                email: email,
                phone: phone
        }

        let clientUpdate = await lambdaFacadeInstance.putUser(user, req.session.authenticationResult?.AccessToken);
        req.session.selfServiceUser = user;
        res.redirect('/add-service-name');
        return;
    } catch (error) {
        if (error instanceof CodeMismatchException) {
            console.debug("Code did not match")
            res.render('create-account/check-mobile.njk', {mobileNumber: req.session.mobileNumber});
        }
        console.error(error);
        res.render('/create/verify-phone-code');
    }
}
