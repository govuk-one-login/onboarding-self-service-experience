import {
    CognitoIdentityProviderServiceException,
    LimitExceededException,
    UserNotFoundException
} from "@aws-sdk/client-cognito-identity-provider";
import {RequestHandler} from "express";
import {port} from "../config/environment";
import AuthenticationResultParser from "../lib/authentication-result-parser";
import {convertToCountryPrefixFormat, obscureNumber} from "../lib/mobile-number";
import {render} from "../middleware/request-handler";
import SelfServiceServicesService from "../services/self-service-services-service";
import {SignupStatus, SignupStatusStage} from "../lib/utils/signup-status";
import console from "console";
import {secureRandom6DigitCode} from "../lib/utils/secure-random-code";
import {getNextPaths, RegisterRoutes, ServicesRoutes, SignInRoutes} from "../middleware/state-machine";

export const showSignInFormEmail = render("sign-in/enter-email-address.njk");
export const showSignInFormEmailGlobalSignOut = render("sign-in/enter-email-address-global-sign-out.njk");

// TODO this only renders the page but it needs to resend the mobile OTP but we need the password to do this or find another way
export const showCheckPhonePage: RequestHandler = (req, res) => {
    console.log("In controllers/sign-in-showCheckPhonePage");

    // TODO we should probably throw here or use middleware to validate the required values
    if (!req.session.emailAddress || !req.session.mfaResponse) {
        console.log("Redirecting to Sign-In");
        return res.redirect(SignInRoutes.enterEmailAddress);
    }

    console.log("Redirecting to Enter Text Code");
    res.render("common/enter-text-code.njk", {
        headerActiveItem: "sign-in",
        values: {
            mobileNumber: obscureNumber(req.session.mfaResponse.codeSentTo),
            textMessageNotReceivedUrl: "/sign-in/resend-text-code"
        }
    });
};

export const confirmPasswordContinueRecovery: RequestHandler = async (req, res) => {
    console.log("In controllers/sign-in:confirmPasswordContinueRecovery()");

    return res.redirect(SignInRoutes.forgotPasswordContinueRecovery);
};

export const finishSignIn: RequestHandler = async (req, res) => {
    console.log("In controllers/sign-in:finishSignIn()");

    const s4: SelfServiceServicesService = req.app.get("backing-service");
    const authenticationResult = nonNull(req.session.authenticationResult);
    console.log("Calling getSelfServiceUser");
    const user = await s4.getSelfServiceUser(authenticationResult);
    console.log("Back from getSelfServiceUser");

    // TODO this should probably be an error
    if (!user) {
        return res.redirect(SignInRoutes.enterTextCode);
    }

    if (req.session.updatedField === "password") {
        console.info("Finishing Sign-In");

        await s4.updateUser(
            AuthenticationResultParser.getCognitoId(authenticationResult),
            {password_last_updated: new Date()},
            nonNull(req.session?.authenticationResult?.AccessToken)
        );
    }

    req.session.isSignedIn = true;
    if (await signedInToAnotherDevice(user.email, s4)) {
        res.redirect(SignInRoutes.signedInToAnotherAccount);
    } else {
        s4.sendTxMALog("SSE_LOG_IN_SUCCESS", {
            session_id: req.session.id,
            ip_address: req.ip,
            user_id: AuthenticationResultParser.getCognitoId(authenticationResult),
            email: user.email
        });

        s4.sendTxMALog(
            "SSE_PHONE_VERIFICATION_COMPLETE",
            {
                session_id: req.session.id,
                ip_address: req.ip,
                user_id: AuthenticationResultParser.getCognitoId(authenticationResult),
                email: user.email
            },
            {
                outcome: "success"
            }
        );

        console.log("Redirecting to Services");
        res.redirect(ServicesRoutes.listServices);
    }
};

async function signedInToAnotherDevice(email: string, s4: SelfServiceServicesService) {
    const sessions = await s4.sessionCount(email);
    console.log(`Found ${sessions} session(s)`);
    return sessions > 1;
}

export const globalSignOut: RequestHandler = async (req, res) => {
    const s4: SelfServiceServicesService = req.app.get("backing-service");
    const authenticationResult = nonNull(req.session.authenticationResult);
    const accessToken = authenticationResult.AccessToken;

    if (accessToken) {
        const user = await s4.getSelfServiceUser(authenticationResult);
        const output = await s4.globalSignOut(user.email, accessToken);
        console.log(`globalSignOut() Session invalidated, Response HTTP Status Code: ${output.status}`);
    }

    req.session.destroy(() => res.redirect(SignInRoutes.enterEmailAddressGlobalSignOut));
};

export const processEmailAddress: RequestHandler = async (req, res) => {
    getNextPaths(req);
    const s4: SelfServiceServicesService = req.app.get("backing-service");
    try {
        const email = req.session.emailAddress as string;
        const signUpStatus: SignupStatus = await s4.getSignUpStatus(email);

        if (!signUpStatus.hasStage(SignupStatusStage.HasEmail)) {
            console.info("Processing No HasEmail");
            return res.redirect(RegisterRoutes.resumeBeforePassword);
        }

        if (!signUpStatus.hasStage(SignupStatusStage.HasPassword)) {
            console.info("Processing No HasPassword");
            return res.redirect(RegisterRoutes.resumeBeforePassword);
        }

        if (!signUpStatus.hasStage(SignupStatusStage.HasPhoneNumber)) {
            console.info("Processing No HasPhoneNumber");
            return res.redirect(RegisterRoutes.resumeAfterPassword);
        }

        if (!signUpStatus.hasStage(SignupStatusStage.HasTextCode)) {
            console.info("Processing No HasTextCode");
            return res.redirect(RegisterRoutes.resumeAfterPassword);
        }
    } catch (UserNotFoundException) {
        // If a user doesn't exist, carry on like normal
    }

    res.redirect(SignInRoutes.enterPassword);
};

export const showSignInFormPassword = render("sign-in/enter-password.njk");
export const showResendPhoneCodePage = render("sign-in/resend-text-code.njk");

export const showSignInPasswordResendTextCode = render("sign-in/resend-text-code/enter-password.njk");

export const processResendPhoneCodePage: RequestHandler = (req, res) => {
    res.redirect(SignInRoutes.passwordResendTextCode);
};

export const forgotPasswordForm: RequestHandler = async (req, res) => {
    const s4: SelfServiceServicesService = req.app.get("backing-service");

    s4.sendTxMALog("SSE_PASSWORD_RESET_REQUESTED", {
        email: req.session.emailAddress,
        session_id: req.session.id,
        ip_address: req.ip
    });

    res.render("sign-in/forgot-password.njk", {
        values: {
            emailAddress: req.session.emailAddress
        }
    });
};

export const checkEmailPasswordReset: RequestHandler = (req, res, next) => {
    return forgotPassword(req, res, next);
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
    } catch (error) {
        if (error instanceof LimitExceededException) {
            console.info("Tried to change password too many times. Advised to try again in 15 minutes.");

            return res.render("sign-in/create-new-password.njk", {
                errorMessages: {
                    password: "You have tried to change your password too many times. Try again in 15 minutes."
                },
                values: {
                    password: password
                }
            });
        }

        throw error;
    }

    req.session.emailAddress = req.body.loginName;
    req.session.updatedField = "password";

    s4.sendTxMALog("SSE_PASSWORD_RESET_COMPLETED", {
        email: req.session.emailAddress,
        session_id: req.session.id,
        ip_address: req.ip
    });

    next();
};

export const organiseDynamoDBForRecoveredUser: RequestHandler = async (req, res, next) => {
    console.log("In controllers/sign-in:organiseDynamoDBForRecoveredUser");
    console.log("*** Authentication Result => " + req.session.authenticationResult);

    const s4: SelfServiceServicesService = req.app.get("backing-service");

    const authenticationResult = nonNull(req.session.authenticationResult);
    const userID = req.session.cognitoID as string;

    await s4.recreateDynamoDBAccountLinks(authenticationResult, userID);

    next();
};

const forgotPassword: RequestHandler = async (req, res) => {
    const s4: SelfServiceServicesService = await req.app.get("backing-service");
    const email = nonNull(req.session.emailAddress);

    let host;

    if (req.hostname === "localhost") {
        host = `${req.hostname}:${port}`;
    } else {
        host = `${req.hostname}`;
    }

    try {
        await s4.forgotPassword(email, req.protocol, host, false);
    } catch (error) {
        if (error instanceof UserNotFoundException) {
            console.log("UserNotFoundException");

            const dynamoDBEntryResponse = await s4.getDynamoDBEntries(email);
            const dynamoDBEntry = JSON.stringify(dynamoDBEntryResponse.data);

            if (dynamoDBEntry != undefined && dynamoDBEntry.length > 2) {
                const clientDetails = JSON.parse(dynamoDBEntry);
                const mobileNumber = convertToCountryPrefixFormat(clientDetails.phone.S);
                const password = secureRandom6DigitCode();

                const userID = clientDetails.pk.S.substring(5); // Skip over 'user#' prefix

                await s4.recoverCognitoAccount(req, email, password, mobileNumber);
                req.session.cognitoID = userID;
                await s4.forgotPassword(email, req.protocol, host, true);

                return res.render("sign-in/enter-email-code.njk");
            }

            req.session.emailAddress = email;
            return res.redirect(SignInRoutes.accountNotFound);
        }

        if (error instanceof CognitoIdentityProviderServiceException) {
            const options: Record<string, Record<string, string | undefined>> = {
                values: {emailAddress: req.session.emailAddress},
                errorMessages: {}
            };

            if (error instanceof UserNotFoundException) {
                console.info("User does not exist.");
                options.errorMessages.emailAddress = "User does not exist.";
            } else if (error instanceof LimitExceededException) {
                console.info("Tried to change password too many times. Advised to try again in 15 minutes.");
                options.errorMessages.emailAddress = "You have tried to change your password too many times. Try again in 15 minutes.";
            } else {
                throw error;
            }

            return res.render("sign-in/enter-email-address.njk", options);
        }

        throw error;
    }

    res.render("sign-in/enter-email-code.njk");
};
