import {AuthenticationResultType} from "@aws-sdk/client-cognito-identity-provider";
import {Request, Response} from "express";
import "express-async-errors";
import {obscureNumber} from "../lib/mobileNumberUtils";
import SelfServiceServicesService from "../services/self-service-services-service";

export const showSignInFormEmail = async function (req: Request, res: Response) {
    res.render("sign-in.njk");
};

export const showCheckPhonePage = async function (req: Request, res: Response) {
    // TODO we should probably throw here or use middleware to validate the required values
    if (!req.session.emailAddress || !req.session.mfaResponse) {
        res.redirect("/sign-in");
        return;
    }

    res.render("common/check-mobile.njk", {
        headerActiveItem: "sign-in",
        values: {
            mobileNumber: obscureNumber(req.session.mfaResponse.codeSentTo),
            textMessageNotReceivedUrl: "/resend-text-code"
        }
    });
};

export const finishSignIn = async function (req: Request, res: Response) {
    const s4: SelfServiceServicesService = req.app.get("backing-service");
    const user = await s4.getSelfServiceUser(req.session.authenticationResult as AuthenticationResultType);

    if (user) {
        req.session.isSignedIn = true;
        res.redirect(`/account/list-services`);
        return;
    } else {
        res.redirect("/sign-in-otp-mobile");
    }
};

export const processEmailAddress = async function (req: Request, res: Response) {
    res.redirect("/sign-in-password");
};

export const showSignInFormPassword = async function (req: Request, res: Response) {
    res.render("sign-in-enter-password.njk");
};

export const signOut = async function (req: Request, res: Response) {
    req.session.destroy(() => res.redirect("/"));
};

export const showResendPhoneCodePage = async function (req: Request, res: Response) {
    res.render("resend-phone-code-sign-in.njk");
};

export const sessionTimeout = async function (req: Request, res: Response) {
    res.render("session-timeout.njk");
};

export const accountExists = async function (req: Request, res: Response) {
    res.render("create-account/existing-account.njk", {
        values: {
            emailAddress: req.session.emailAddress
        }
    });
};

export const forgotPasswordForm = async function (req: Request, res: Response) {
    res.render("forgot-password.njk", {
        values: {
            emailAddress: req.session.emailAddress
        }
    });
};

export const checkEmailPasswordReset = async function (req: Request, res: Response) {
    await forgotPassword(req);
    res.render("check-email-password-reset.njk");
};

const forgotPassword = async function (req: Request) {
    const s4: SelfServiceServicesService = await req.app.get("backing-service");
    await s4.forgotPassword(req.session.emailAddress as string);
};
