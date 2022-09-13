import {
    AttributeType,
    CodeMismatchException,
    NotAuthorizedException,
    UsernameExistsException
} from "@aws-sdk/client-cognito-identity-provider";
import {randomUUID} from "crypto";
import {NextFunction, Request, Response} from "express";
import {RedirectError, SelfServiceErrors} from "../lib/errors";
import {SelfServiceError} from "../lib/SelfServiceError";
import CognitoInterface from "../services/cognito/CognitoClient.interface";
import LambdaFacadeInterface from "../services/lambda/LambdaFacadeInterface";

export const showGetEmailForm = function (req: Request, res: Response) {
    res.render("create-account/get-email.njk");
};

export const processGetEmailForm = async function (req: Request, res: Response, next: NextFunction) {
    const emailAddress: string = req.body.emailAddress;
    const cognitoClient: CognitoInterface = await req.app.get("cognitoClient");

    try {
        await cognitoClient.createUser(emailAddress);
    } catch (error) {
        if (error instanceof UsernameExistsException) {
            // TODO We need to handle this properly with another flow
            throw new RedirectError("/sign-in");
        }

        next(error);
    }

    req.session.emailAddress = emailAddress;
    res.redirect("check-email");
};

export const showCheckEmailForm = function (req: Request, res: Response, next: NextFunction) {
    if (!req.session.emailAddress) {
        next(SelfServiceErrors.Redirect("/create/get-email"));
    }
    res.render("create-account/check-email.njk", {values: {emailAddress: req.session.emailAddress}});
};

export const submitEmailOtp = async function (req: Request, res: Response, next: NextFunction) {
    if (!req.session.emailAddress) {
        next(SelfServiceErrors.Redirect("/create/get-email"));
    }
    const cognitoClient: CognitoInterface = await req.app.get("cognitoClient");

    try {
        const response = await cognitoClient.login(req.session.emailAddress as string, req.body["create-email-otp"]);
        req.session.cognitoSession = response.Session;
        res.redirect("/create/update-password");
        return;
    } catch (error) {
        if (error instanceof NotAuthorizedException) {
            next(
                SelfServiceErrors.Render(
                    "create-email-otp",
                    "The code you entered is not correct or has expired - enter it again or request a new code",
                    {
                        values: {emailAddress: req.session.emailAddress as string},
                        errorMessages: {
                            "create-email-otp": "The code you entered is not correct or has expired - enter it again or request a new code"
                        }
                    }
                )
            );
        } else {
            next(error);
        }
    }
};

export const showNewPasswordForm = async function (req: Request, res: Response) {
    if (req.session.cognitoSession !== undefined) {
        res.render("create-account/new-password.njk");
        return;
    } else {
        // TODO: This flow needs designing
        res.redirect("/sign-in");
    }
};

export const updatePassword = async function (req: Request, res: Response, next: NextFunction) {
    const cognitoClient: CognitoInterface = await req.app.get("cognitoClient");

    const response = await cognitoClient.setNewPassword(
        req.session.emailAddress as string,
        req.body["password"],
        req.session.cognitoSession as string
    );
    req.session.cognitoSession = response.Session;
    req.session.authenticationResult = response.AuthenticationResult;

    const user = await cognitoClient.getUser(req.session.emailAddress as string);
    // TODO: Do something better with this
    req.session.cognitoUser = user;
    let email: string | undefined;

    if (user.UserAttributes) {
        email = user.UserAttributes.filter((attribute: AttributeType) => attribute.Name === "email")[0].Value;
    }

    if (email === undefined) {
        throw new SelfServiceError("Email not present");
    }

    await cognitoClient.setEmailAsVerified(email);
    res.redirect("/create/enter-mobile");
};

export const showEnterMobileForm = async function (req: Request, res: Response) {
    const accessToken: string | undefined = req.session.authenticationResult?.AccessToken;
    if (accessToken === undefined) {
        // user must log in before we can process their mobile number
        res.redirect("/sign-in");
        return;
    }
    if (req.session.mobileNumber === undefined) {
        res.render("create-account/enter-mobile.njk");
    } else {
        const value: object = {mobileNumber: req.session.mobileNumber};
        res.render("create-account/enter-mobile.njk", {
            value: value
        });
    }
};

export const processEnterMobileForm = async function (req: Request, res: Response) {
    // The user needs to be logged in for this
    const accessToken: string | undefined = req.session.authenticationResult?.AccessToken;
    if (accessToken === undefined) {
        // user must log in before we can process their mobile number
        res.redirect("/sign-in");
        return;
    }

    const mobileNumber: string | undefined = req.session.mobileNumber;
    const cognitoClient = req.app.get("cognitoClient");
    if (mobileNumber === undefined) {
        res.render("create-account/enter-mobile.njk");
        return;
    }

    await cognitoClient.setPhoneNumber(req.session.emailAddress, mobileNumber);

    // presumably that was fine so let's try to verify the number
    const codeSent = await cognitoClient.sendMobileNumberVerificationCode(accessToken);
    console.debug("VERIFICATION CODE RESPONSE");
    console.debug(codeSent);
    req.session.mobileNumber = mobileNumber;
    res.render("check-mobile.njk", {
        values: {
            mobileNumber: req.body.mobileNumber,
            formActionUrl: "/create/verify-phone-code",
            textMessageNotReceivedUrl: "/create/resend-phone-code"
        }
    });
};

export const resendMobileVerificationCode = async function (req: Request, res: Response) {
    req.body.mobileNumber = req.session.mobileNumber;
    await processEnterMobileForm(req, res);
};

export const submitMobileVerificationCode = async function (req: Request, res: Response) {
    // need to check for access token in middleware
    if (req.session.authenticationResult?.AccessToken === undefined) {
        res.redirect("/sign-in");
        return;
    }

    const cognitoClient = req.app.get("cognitoClient");
    const otp = req.body["sms-otp"];
    if (otp === undefined) {
        res.render("check-mobile.njk", {
            mobileNumber: req.session.mobileNumber,
            formActionUrl: "/create/verify-phone-code",
            textMessageNotReceivedUrl: "/create/resend-phone-code"
        });
        return;
    }

    try {
        await cognitoClient.verifySmsCode(req.session.authenticationResult?.AccessToken, otp);

        const uuid = randomUUID();
        const email = req.session.cognitoUser?.UserAttributes?.filter((attribute: AttributeType) => attribute.Name === "email")[0].Value;
        const phone = req.session.enteredMobileNumber;

        await cognitoClient.setMfaPreference(req.session.cognitoUser?.Username as string);

        const user = {
            pk: `user#${uuid}`,
            sk: `cognito_username#${req.session.cognitoUser?.Username}`,
            data: "we haven't collected this full name",
            first_name: "we haven't collected this first name",
            last_name: "we haven't collected this last name",
            email: email,
            phone: phone,
            password_last_updated: new Date()
        };

        const lambdaFacade: LambdaFacadeInterface = req.app.get("lambdaFacade");
        await lambdaFacade.putUser(user, req.session.authenticationResult?.AccessToken);

        req.session.selfServiceUser = (
            await lambdaFacade.getUserByCognitoId(
                `cognito_username#${req.session.cognitoUser?.Username}`,
                req.session?.authenticationResult?.AccessToken as string
            )
        ).data.Items[0];
        res.redirect("/add-service-name");
        return;
    } catch (error) {
        if (error instanceof CodeMismatchException) {
            const errorMessages = new Map<string, string>();
            errorMessages.set("smsOtp", "The code you entered is not correct or has expired - enter it again or request a new code");
            res.render("check-mobile.njk", {
                mobileNumber: req.session.mobileNumber,
                errorMessages: errorMessages,
                formActionUrl: "/create/verify-phone-code",
                textMessageNotReceivedUrl: "/create/resend-phone-code"
            });
            return;
        }
        console.error(error);
        res.redirect("/there-is-a-problem");
        return;
    }
};

export const showResendPhoneCodeForm = async function (req: Request, res: Response) {
    const accessToken: string | undefined = req.session.authenticationResult?.AccessToken;
    if (accessToken === undefined) {
        // user must log in before we can process their mobile number
        res.redirect("/sign-in");
        return;
    }
    res.render("create-account/resend-phone-code.njk");
};

export const showResendEmailCodeForm = async function (req: Request, res: Response) {
    res.render("create-account/resend-email-code.njk");
};

export const resendEmailVerificationCode = async function (req: Request, res: Response) {
    req.body.emailAddress = req.session.emailAddress;
    const emailAddress: string = req.body.emailAddress;
    const cognitoClient: CognitoInterface = req.app.get("cognitoClient");

    let result: any;
    try {
        result = await cognitoClient.resendEmailAuthCode(emailAddress);
        console.debug(result);
    } catch (error) {
        console.error(error);
        res.redirect("/there-is-a-problem");
        return;
    }
    res.redirect("check-email");
};
