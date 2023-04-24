import {
    CodeMismatchException,
    CognitoIdentityProviderServiceException,
    LimitExceededException,
    NotAuthorizedException
} from "@aws-sdk/client-cognito-identity-provider";
import {RequestHandler} from "express";
import AuthenticationResultParser from "../lib/authentication-result-parser";
import {convertToCountryPrefixFormat} from "../lib/mobile-number";
import parseDate from "../lib/utils/time";
import {render} from "../middleware/request-handler";
import SelfServiceServicesService from "../services/self-service-services-service";

export const showAccount: RequestHandler = async (req, res) => {
    const authenticationResult = nonNull(req.session.authenticationResult);
    const s4: SelfServiceServicesService = req.app.get("backing-service");
    const user = await s4.getSelfServiceUser(authenticationResult);

    res.render("account/account.njk", {
        emailAddress: user.email,
        mobilePhoneNumber: user.mobileNumber,
        passwordLastChanged: `Last updated ${parseDate(user.passwordLastUpdated)}`,
        serviceName: "My juggling service",
        updatedField: req.session.updatedField
    });

    req.session.mobileNumber = AuthenticationResultParser.getPhoneNumber(authenticationResult);
    req.session.updatedField = undefined;
};

export const changePasswordForm = render("account/change-password.njk");

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
    res.redirect("/account");
};

export const changePhoneNumberForm = render("account/change-phone-number.njk");

export const changePhoneNumber: RequestHandler = async (req, res) => {
    const s4: SelfServiceServicesService = req.app.get("backing-service");

    await s4.setPhoneNumber(
        AuthenticationResultParser.getEmail(nonNull(req.session.authenticationResult)),
        convertToCountryPrefixFormat(req.body.mobileNumber)
    );

    await s4.sendMobileNumberVerificationCode(nonNull(req.session.authenticationResult?.AccessToken));

    req.session.enteredMobileNumber = req.body.mobileNumber;
    res.redirect("/account/change-phone-number/enter-text-code");
};

export const enterTextCodeForm: RequestHandler = (req, res) => {
    res.render("common/enter-text-code.njk", {
        values: {
            mobileNumber: req.session.enteredMobileNumber,
            textMessageNotReceivedUrl: "/account/change-phone-number/resend-text-code"
        }
    });
};

export const submitTextCode: RequestHandler = async (req, res) => {
    const authenticationResult = nonNull(req.session.authenticationResult);
    const accessToken = nonNull(authenticationResult.AccessToken);
    const s4: SelfServiceServicesService = req.app.get("backing-service");

    try {
        await s4.verifyMobileUsingSmsCode(accessToken, req.body.securityCode);
    } catch (error) {
        if (error instanceof CodeMismatchException) {
            return res.render("common/enter-text-code.njk", {
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
    res.redirect("/account");
};
