import {
    CodeMismatchException,
    CognitoIdentityProviderServiceException,
    LimitExceededException,
    NotAuthorizedException
} from "@aws-sdk/client-cognito-identity-provider";
import {RequestHandler} from "express";
import AuthenticationResultParser from "../lib/authentication-result-parser";
import {convertToCountryPrefixFormat} from "../lib/mobile-number";
import {render} from "../middleware/request-handler";
import SelfServiceServicesService from "../services/self-service-services-service";

export const showChangePasswordForm = render("account/change-password.njk");

export const showAccount: RequestHandler = async (req, res) => {
    const authenticationResult = nonNull(req.session.authenticationResult);
    const s4: SelfServiceServicesService = req.app.get("backing-service");
    const user = await s4.getSelfServiceUser(authenticationResult);

    res.render("account/account.njk", {
        emailAddress: user.email,
        mobilePhoneNumber: user.mobileNumber,
        passwordLastChanged: lastUpdated(user.passwordLastUpdated),
        serviceName: "My juggling service",
        updatedField: req.session.updatedField
    });

    req.session.mobileNumber = AuthenticationResultParser.getPhoneNumber(authenticationResult);
    req.session.updatedField = undefined;
};

export const changePassword: RequestHandler = async (req, res) => {
    const newPassword = req.body.newPassword;
    const currentPassword = req.body.currentPassword;
    const authenticationResult = nonNull(req.session.authenticationResult);
    const accessToken = nonNull(authenticationResult.AccessToken);
    const s4: SelfServiceServicesService = req.app.get("backing-service");

    try {
        await s4.changePassword(accessToken, currentPassword, newPassword);
    } catch (error) {
        if (error instanceof CognitoIdentityProviderServiceException) {
            const options: Record<string, Record<string, string>> = {values: {newPassword: newPassword}};

            if (error instanceof LimitExceededException) {
                options.errorMessages.newPassword = "You have tried to change your password too many times. Try again in 15 minutes.";
                options.values.currentPassword = currentPassword;
            } else if (error instanceof NotAuthorizedException) {
                options.errorMessages.newPassword = "Your current password is incorrect";
            } else {
                throw error;
            }

            return res.render("account/change-password.njk", options);
        }

        throw error;
    }

    await s4.updateUser(AuthenticationResultParser.getCognitoId(authenticationResult), {password_last_updated: new Date()}, accessToken);

    req.session.updatedField = "password";

    await s4.sendTxMALog({
        userIp: req.ip,
        event: "UPDATE_PASSWORD",
        journeyId: req.session.id,
        userId: AuthenticationResultParser.getCognitoId(authenticationResult)
    });

    res.redirect("/account");
};

export const showChangePhoneNumberForm = render("account/change-phone-number.njk");

export const processChangePhoneNumberForm: RequestHandler = async (req, res) => {
    const s4: SelfServiceServicesService = req.app.get("backing-service");

    await s4.setPhoneNumber(
        AuthenticationResultParser.getEmail(nonNull(req.session.authenticationResult)),
        convertToCountryPrefixFormat(req.body.mobileNumber)
    );

    await s4.sendMobileNumberVerificationCode(nonNull(req.session.authenticationResult?.AccessToken));

    req.session.enteredMobileNumber = req.body.mobileNumber;

    await s4.sendTxMALog({
        userIp: req.ip,
        event: "UPDATE_PHONE_REQUEST",
        phoneNumber: req.session.enteredMobileNumber,
        journeyId: req.session.id
    });

    res.redirect("/account/change-phone-number/enter-text-code");
};

export const showVerifyMobileWithSmsCode: RequestHandler = (req, res) => {
    res.render("common/enter-text-code.njk", {
        headerActiveItem: "your-account",
        values: {
            mobileNumber: req.session.enteredMobileNumber,
            textMessageNotReceivedUrl: "/account/change-phone-number/resend-text-code"
        }
    });
};

export const verifyMobileWithSmsCode: RequestHandler = async (req, res) => {
    const authenticationResult = nonNull(req.session.authenticationResult);
    const accessToken = nonNull(authenticationResult.AccessToken);
    const s4: SelfServiceServicesService = req.app.get("backing-service");

    try {
        await s4.verifyMobileUsingSmsCode(accessToken, req.body.securityCode);
    } catch (error) {
        if (error instanceof CodeMismatchException) {
            await s4.sendTxMALog({
                userIp: req.ip,
                event: "PHONE_VERIFICATION_COMPLETE",
                phoneNumber: req.session.enteredMobileNumber,
                journeyId: req.session.id,
                userId: AuthenticationResultParser.getCognitoId(authenticationResult),
                outcome: "failed"
            });

            return res.render("common/enter-text-code.njk", {
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
        }

        throw error;
    }

    await s4.setMobilePhoneAsVerified(AuthenticationResultParser.getEmail(nonNull(req.session.authenticationResult)));

    await s4.updateUser(
        AuthenticationResultParser.getCognitoId(authenticationResult),
        {phone: nonNull(req.session.enteredMobileNumber)},
        accessToken
    );

    req.session.mobileNumber = req.session.enteredMobileNumber;
    req.session.enteredMobileNumber = undefined;
    req.session.updatedField = "mobile phone number";

    await s4.sendTxMALog({
        userIp: req.ip,
        event: "PHONE_VERIFICATION_COMPLETE",
        phoneNumber: req.session.enteredMobileNumber,
        journeyId: req.session.id,
        userId: AuthenticationResultParser.getCognitoId(authenticationResult),
        outcome: "success"
    });

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
