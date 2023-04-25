import {AuthenticationResultType, LimitExceededException, UserNotFoundException} from "@aws-sdk/client-cognito-identity-provider";
import {RequestHandler} from "express";
import AuthenticationResultParser from "../lib/authentication-result-parser";
import {obscureNumber} from "../lib/mobile-number";
import SelfServiceServicesService from "../services/self-service-services-service";

export const showSignInFormEmail: RequestHandler = (req, res) => {
    res.render("sign-in/enter-email-address.njk");
};

// TODO this only renders the page but it needs to resend the mobile OTP but we need the password to do this or find another way
export const showCheckPhonePage: RequestHandler = (req, res) => {
    // TODO we should probably throw here or use middleware to validate the required values
    if (!req.session.emailAddress || !req.session.mfaResponse) {
        res.redirect("/sign-in");
        return;
    }

    res.render("common/enter-text-code.njk", {
        headerActiveItem: "sign-in",
        values: {
            mobileNumber: obscureNumber(req.session.mfaResponse.codeSentTo),
            textMessageNotReceivedUrl: "/sign-in/resend-text-code"
        }
    });
};

export const finishSignIn: RequestHandler = async (req, res) => {
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

export const processEmailAddress: RequestHandler = (req, res) => {
    res.redirect("/sign-in/enter-password");
};

export const showSignInFormPassword: RequestHandler = (req, res) => {
    res.render("sign-in/enter-password.njk");
};

export const showResendPhoneCodePage: RequestHandler = (req, res) => {
    res.render("sign-in/resend-text-code.njk");
};

export const forgotPasswordForm: RequestHandler = (req, res) => {
    res.render("sign-in/forgot-password.njk", {
        values: {
            emailAddress: req.session.emailAddress
        }
    });
};

export const checkEmailPasswordReset: RequestHandler = async (req, res, next) => {
    await forgotPassword(req, res, next);
};

export const confirmForgotPasswordForm: RequestHandler = (req, res) => {
    res.render("sign-in/create-new-password.njk", {
        loginName: req.query.loginName,
        confirmationCode: req.query.confirmationCode
    });
};

export const confirmForgotPassword: RequestHandler = async (req, res, next) => {
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
            res.render("sign-in/create-new-password.njk", {
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

const forgotPassword: RequestHandler = async (req, res) => {
    const s4: SelfServiceServicesService = await req.app.get("backing-service");
    const uri = `${req.protocol}://${req.hostname}:${process.env.PORT}`;
    try {
        await s4.forgotPassword(req.session.emailAddress as string, uri as string);
    } catch (error) {
        if (error instanceof UserNotFoundException) {
            res.render("sign-in/enter-email-address.njk", {
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
            res.render("sign-in/enter-email-address.njk", {
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
    res.render("sign-in/enter-email-code.njk");
};
