import {CodeMismatchException, NotAuthorizedException, UsernameExistsException} from "@aws-sdk/client-cognito-identity-provider";
import {randomUUID} from "crypto";
import {NextFunction, Request, Response} from "express";
import {RedirectError, SelfServiceErrors} from "../lib/errors";
import SelfServiceServicesService from "../services/self-service-services-service";
import AuthenticationResultParser from "../lib/AuthenticationResultParser";
import {prepareForCognito} from "../lib/mobileNumberUtils";

export const showGetEmailForm = function (req: Request, res: Response) {
    res.render("create-account/get-email.njk");
    return;
};

export const processGetEmailForm = async function (req: Request, res: Response, next: NextFunction) {
    const emailAddress: string = req.body.emailAddress;
    const s4: SelfServiceServicesService = await req.app.get("backing-service");
    try {
        await s4.createUser(emailAddress);
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
    const s4: SelfServiceServicesService = await req.app.get("backing-service");

    try {
        const response = await s4.submitUsernamePassword(req.session.emailAddress as string, req.body["create-email-otp"]);
        req.session.cognitoSession = response.Session;
        res.redirect("/create/update-password");
        return;
    } catch (error) {
        if (error instanceof NotAuthorizedException) {
            next(
                SelfServiceErrors.Render(
                    "create-account/check-email.njk",
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
    const s4: SelfServiceServicesService = req.app.get("backing-service");

    req.session.authenticationResult = await s4.setNewPassword(
        req.session.emailAddress as string,
        req.body["password"],
        req.session.cognitoSession as string
    );
    await s4.setEmailAsVerified(req.session.emailAddress as string);
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
        res.render("create-account/enter-mobile.njk", {
            value: {mobileNumber: req.session.mobileNumber}
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

    const mobileNumber = prepareForCognito(req.body.mobileNumber);
    const s4: SelfServiceServicesService = await req.app.get("backing-service");

    await s4.setPhoneNumber(req.session.emailAddress as string, mobileNumber);
    await s4.sendMobileNumberVerificationCode(accessToken);

    req.session.mobileNumber = mobileNumber;
    req.session.enteredMobileNumber = req.body.mobileNumber;
    res.render("check-mobile.njk", {
        values: {
            mobileNumber: req.session.enteredMobileNumber,
            formActionUrl: "/create/verify-phone-code",
            textMessageNotReceivedUrl: "/create/resend-phone-code"
        }
    });
};

export const resendMobileVerificationCode = async function (req: Request, res: Response) {
    req.body.mobileNumber = req.session.enteredMobileNumber;
    await processEnterMobileForm(req, res);
};

export const submitMobileVerificationCode = async function (req: Request, res: Response) {
    // This is the mobile verification when creating a new user
    // need to check for access token in middleware
    if (req.session.authenticationResult?.AccessToken === undefined) {
        res.redirect("/sign-in");
        return;
    }

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
        const s4: SelfServiceServicesService = req.app.get("backing-service");
        await s4.verifyMobileUsingSmsCode(req.session.authenticationResult?.AccessToken, otp);

        const uuid = randomUUID();
        const email = AuthenticationResultParser.getEmail(req.session.authenticationResult);
        const phone = req.session.enteredMobileNumber;
        const cognitoId = AuthenticationResultParser.getCognitoId(req.session.authenticationResult);

        await s4.setMfaPreference(cognitoId);

        const user = {
            pk: `user#${uuid}`,
            sk: `cognito_username#${cognitoId}`,
            data: "we haven't collected this full name",
            first_name: "we haven't collected this first name",
            last_name: "we haven't collected this last name",
            email: email,
            phone: phone,
            password_last_updated: new Date()
        };

        await s4.putUser(user, req.session.authenticationResult?.AccessToken);
        req.session.selfServiceUser = await s4.getSelfServiceUser(req.session?.authenticationResult);
        req.session.isSignedIn = true;
        res.redirect("/add-service-name");
        return;
    } catch (error) {
        if (error instanceof CodeMismatchException) {
            const value: object = {otp: req.body["sms-otp"]};
            res.render("check-mobile.njk", {
                values: {
                    mobileNumber: req.session.enteredMobileNumber
                },
                value: value,
                errorMessages: {smsOtp: "The code you entered is not correct or has expired - enter it again or request a new code"},
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
    const s4: SelfServiceServicesService = await req.app.get("backing-service");

    let result: any;
    try {
        result = await s4.resendEmailAuthCode(emailAddress);
        console.debug(result);
    } catch (error) {
        console.error(error);
        res.redirect("/there-is-a-problem");
        return;
    }
    res.redirect("check-email");
};
