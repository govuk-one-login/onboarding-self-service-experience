import {
    AuthenticationResultType,
    CodeMismatchException,
    LimitExceededException,
    NotAuthorizedException
} from "@aws-sdk/client-cognito-identity-provider";
import {Request, Response} from "express";
import {User} from "../../@types/user";
import AuthenticationResultParser from "../lib/AuthenticationResultParser";
import {convertToCountryPrefixFormat} from "../lib/mobileNumberUtils";
import SelfServiceServicesService from "../services/self-service-services-service";

export const showChangePasswordForm = async function (req: Request, res: Response) {
    res.render("account/change-password.njk");
};

export const showAccount = async function (req: Request, res: Response) {
    if (!req.session.authenticationResult) {
        res.redirect("/sign-in");
        return;
    }

    req.session.mobileNumber = AuthenticationResultParser.getPhoneNumber(req.session.authenticationResult as AuthenticationResultType);

    const s4: SelfServiceServicesService = req.app.get("backing-service");
    const user: User = await s4.getSelfServiceUser(req.session.authenticationResult as AuthenticationResultType);

    res.render("account/account.njk", {
        emailAddress: user.email,
        mobilePhoneNumber: user.mobileNumber,
        passwordLastChanged: lastUpdated(user.passwordLastUpdated),
        serviceName: "My juggling service",
        updatedField: req.session.updatedField
    });
    req.session.updatedField = undefined;
};

export const changePassword = async function (req: Request, res: Response) {
    const newPassword = req.body.newPassword;
    const currentPassword = req.body.currentPassword;

    // TODO Use a password validator
    if (currentPassword === "") {
        res.render("account/change-password.njk", {
            errorMessages: {
                currentPassword: "Enter your current password"
            }
        });

        return;
    }

    if (newPassword === "") {
        res.render("account/change-password.njk", {
            values: {
                currentPassword: currentPassword
            },
            errorMessages: {
                newPassword: "Enter your new password"
            }
        });

        return;
    }

    if (newPassword.length < 8) {
        res.render("account/change-password.njk", {
            values: {
                currentPassword: currentPassword,
                newPassword: newPassword
            },
            errorMessages: {
                newPassword: "Your password must be 8 characters or more"
            }
        });

        return;
    }

    try {
        const s4: SelfServiceServicesService = await req.app.get("backing-service");
        await s4.changePassword(req.session?.authenticationResult?.AccessToken as string, currentPassword, newPassword);
    } catch (error) {
        if (error instanceof LimitExceededException) {
            res.render("account/change-password.njk", {
                errorMessages: {
                    newPassword: "You have tried to change your password too many times. Try again in 15 minutes."
                },
                values: {
                    currentPassword: currentPassword,
                    newPassword: newPassword
                }
            });

            return;
        }

        if (error instanceof NotAuthorizedException) {
            res.render("account/change-password.njk", {
                errorMessages: {
                    currentPassword: "Your current password is incorrect"
                },
                values: {
                    currentPassword: "",
                    newPassword: newPassword
                }
            });

            return;
        }

        throw error;
    }

    const s4: SelfServiceServicesService = await req.app.get("backing-service");
    await s4.updateUser(
        AuthenticationResultParser.getCognitoId(req.session.authenticationResult as AuthenticationResultType),
        {password_last_updated: new Date()},
        req.session?.authenticationResult?.AccessToken as string
    );

    req.session.updatedField = "password";
    res.redirect("/account");
};

export const showChangePhoneNumberForm = async function (req: Request, res: Response) {
    res.render("account/change-phone-number.njk");
};

export const processChangePhoneNumberForm = async function (req: Request, res: Response) {
    const s4: SelfServiceServicesService = await req.app.get("backing-service");
    await s4.setPhoneNumber(
        AuthenticationResultParser.getEmail(req.session.authenticationResult as AuthenticationResultType),
        convertToCountryPrefixFormat(req.body.mobileNumber)
    );

    req.session.enteredMobileNumber = req.body.mobileNumber;
    await s4.sendMobileNumberVerificationCode(req.session.authenticationResult?.AccessToken as string);

    res.redirect("/account/change-phone-number/enter-text-code");
};

export const showVerifyMobileWithSmsCode = async function (req: Request, res: Response) {
    res.render("common/check-mobile.njk", {
        headerActiveItem: "your-account",
        values: {
            mobileNumber: req.session.enteredMobileNumber,
            textMessageNotReceivedUrl: "/account/change-phone-number/resend-text-code"
        }
    });
};

export const verifyMobileWithSmsCode = async function (req: Request, res: Response) {
    const s4: SelfServiceServicesService = await req.app.get("backing-service");
    const accessToken = req.session.authenticationResult?.AccessToken as string;

    try {
        await s4.verifyMobileUsingSmsCode(accessToken, req.body.securityCode);
        await s4.setMobilePhoneAsVerified(
            AuthenticationResultParser.getEmail(req.session.authenticationResult as AuthenticationResultType) as string
        );

        await s4.updateUser(
            AuthenticationResultParser.getCognitoId(req.session.authenticationResult as AuthenticationResultType),
            {phone: req.session.enteredMobileNumber as string},
            accessToken as string
        );

        req.session.mobileNumber = req.session.enteredMobileNumber;
        req.session.enteredMobileNumber = undefined;
    } catch (error) {
        if (error instanceof CodeMismatchException) {
            res.render("common/check-mobile.njk", {
                headerActiveItem: "your-account",
                values: {
                    securityCode: req.body.securityCode,
                    mobileNumber: req.session.enteredMobileNumber,
                    textMessageNotReceivedUrl: "/account/change-phone-number/resend-text-code"
                },
                errorMessages: {
                    securityCode: "The code you entered is not correct or has expired - enter it again or request a new code"
                }
            });

            return;
        }

        throw error;
    }

    req.session.updatedField = "mobile phone number";
    res.redirect("/account");
};

function lastUpdated(lastUpdated: string): string {
    const lastUpdateMillis: number = +new Date(lastUpdated);
    const now = +new Date();

    if (lastUpdateMillis > fiveMinutesBefore(now)) {
        return "Last updated just now";
    } else if (wasToday(lastUpdateMillis)) {
        return "Last updated today";
    } else {
        return `Last updated ${new Date(lastUpdateMillis).toLocaleDateString("en-gb", {
            weekday: "long",
            day: "numeric",
            year: "numeric",
            month: "long"
        })}`;
    }
}

function fiveMinutesBefore(someTime: number): number {
    return someTime - 5 * 60 * 1_000;
}

function wasToday(someTime: number): boolean {
    const today = new Date(new Date().toLocaleDateString());
    return someTime > today.getTime();
}
