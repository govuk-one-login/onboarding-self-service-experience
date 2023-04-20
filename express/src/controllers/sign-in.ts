import {AuthenticationResultType, LimitExceededException, UserNotFoundException} from "@aws-sdk/client-cognito-identity-provider";
import {NextFunction, Request, Response} from "express";
import "express-async-errors";
import AuthenticationResultParser from "../lib/AuthenticationResultParser";
import {obscureNumber} from "../lib/mobileNumberUtils";
import SelfServiceServicesService from "../services/self-service-services-service";

export const showSignInFormEmail = async function (req: Request, res: Response) {
    res.render("sign-in.njk");
};

export const showCheckPhoneForm = async function (req: Request, res: Response) {
    if (!req.session.emailAddress || !req.session.mfaResponse) {
        res.redirect("/sign-in");
        return;
    }

    res.render("common/check-mobile.njk", {
        headerActiveItem: "sign-in",
        values: {
            mobileNumber: obscureNumber(req.session.mfaResponse.codeSentTo),
            textMessageNotReceivedUrl: "/sign-in/resend-text-code"
        }
    });
};

export const finishSignIn = async function (req: Request, res: Response) {
    const s4: SelfServiceServicesService = req.app.get("backing-service");
    const user = await s4.getSelfServiceUser(req.session.authenticationResult as AuthenticationResultType);

    if (user) {
        req.session.isSignedIn = true;
        if (req.session.updatedField === "password") {
            await s4.updateUser(
                AuthenticationResultParser.getCognitoId(req.session.authenticationResult as AuthenticationResultType),
                {password_last_updated: new Date()},
                req.session?.authenticationResult?.AccessToken as string
            );
        }
        res.redirect(`/services`);
        return;
    } else {
        res.redirect("/sign-in/enter-text-code");
    }
};

export const processEmailAddress = async function (req: Request, res: Response) {
    res.redirect("/sign-in/enter-password");
};

export const showSignInFormPassword = async function (req: Request, res: Response) {
    res.render("sign-in-enter-password.njk");
};

export const showResendPhoneCodeForm = async function (req: Request, res: Response) {
    res.render("resend-phone-code-sign-in.njk");
};

export const forgotPasswordForm = async function (req: Request, res: Response) {
    res.render("forgot-password.njk", {
        values: {
            emailAddress: req.session.emailAddress
        }
    });
};

export const checkEmailPasswordReset = async function (req: Request, res: Response) {
    await forgotPassword(req, res);
};

export const confirmForgotPasswordForm = async function (req: Request, res: Response) {
    res.render("create-new-password.njk", {
        loginName: req.query.loginName,
        confirmationCode: req.query.confirmationCode
    });
};

export const confirmForgotPassword = async function (req: Request, res: Response, next: NextFunction) {
    const loginName = req.body.loginName;
    const password = req.body.password;
    const confirmationCode = req.body.confirmationCode;
    const s4: SelfServiceServicesService = await req.app.get("backing-service");

    try {
        await s4.confirmForgotPassword(loginName as string, password as string, confirmationCode as string);
        req.session.emailAddress = req.body.loginName;
        req.session.updatedField = "password";
        next();
    } catch (error) {
        if (error instanceof LimitExceededException) {
            res.render("create-new-password.njk", {
                errorMessages: {
                    password: "You have tried to change your password too many times. Try again in 15 minutes."
                },
                values: {
                    password: password
                }
            });
            return;
        }
        throw error;
    }
};

const forgotPassword = async function (req: Request, res: Response) {
    const s4: SelfServiceServicesService = await req.app.get("backing-service");
    const uri = `${req.protocol}://${req.hostname}:${process.env.PORT}`;
    try {
        await s4.forgotPassword(req.session.emailAddress as string, uri as string);
    } catch (error) {
        if (error instanceof UserNotFoundException) {
            res.render("sign-in.njk", {
                errorMessages: {
                    emailAddress: "User does not exist."
                },
                values: {
                    emailAddress: req.session.emailAddress
                }
            });
            return;
        }
        if (error instanceof LimitExceededException) {
            res.render("sign-in.njk", {
                errorMessages: {
                    emailAddress: "You have tried to change your password too many times. Try again in 15 minutes."
                },
                values: {
                    emailAddress: req.session.emailAddress
                }
            });
            return;
        }
        throw error;
    }
    res.render("check-email-password-reset.njk");
};

export const processResendPhoneCodeForm = async function (req: Request, res: Response) {
    // TODO Ask for password or to log in again
};
