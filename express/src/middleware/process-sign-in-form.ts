import {NotAuthorizedException, UserNotFoundException} from "@aws-sdk/client-cognito-identity-provider";
import {RequestHandler} from "express";
import SelfServiceServicesService from "../services/self-service-services-service";
import {convertToCountryPrefixFormat} from "../lib/mobile-number";
import * as process from "process";
import {
    getFixedOTPCredentialEmailAddress,
    getFixedOTPCredentialPassword,
    isFixedOTPCredential,
    isPseudonymisedFixedOTPCredential
} from "../lib/fixedOTP";
import logger from "../lib/logger";

export default function processSignInForm(template: string): RequestHandler {
    logger.debug("In processSignInForm()");

    return async (req, res) => {
        let email = req.session.emailAddress as string;
        let password = req.body.password;
        const s4: SelfServiceServicesService = req.app.get("backing-service");

        if (isPseudonymisedFixedOTPCredential(email)) {
            email = getFixedOTPCredentialEmailAddress(email);
        }

        if (isPseudonymisedFixedOTPCredential(password)) {
            password = getFixedOTPCredentialPassword(password);
        }

        if (password == null || password.length === 0) {
            return res.render(template, {
                values: {
                    password: password,
                    emailAddress: email
                },
                errorMessages: {
                    password: "Enter your password"
                }
            });
        }

        try {
            req.session.mfaResponse = await s4.login(email, password);
        } catch (error) {
            logger.debug(JSON.stringify(error));

            if (error instanceof NotAuthorizedException) {
                logger.debug("NotAuthorizedException");

                s4.sendTxMALog(
                    "SSE_INVALID_CREDENTIAL",
                    {
                        email: email,
                        session_id: req.session.id,
                        ip_address: req.ip
                    },
                    {
                        credential_type: "password"
                    }
                );

                return res.render(template, {
                    values: {
                        password: password,
                        emailAddress: email
                    },
                    errorMessages: {
                        password: "Incorrect password"
                    }
                });
            }

            if (error instanceof UserNotFoundException) {
                logger.debug("UserNotFoundException");

                if (process.env.USE_COGNITO_DR == "true") {
                    const dynamoDBEntryResponse = await s4.getDynamoDBEntries(email);
                    const dynamoDBEntry = JSON.stringify(dynamoDBEntryResponse.data);

                    if (dynamoDBEntry != undefined && dynamoDBEntry.length > 2) {
                        const clientDetails = JSON.parse(dynamoDBEntry);
                        const userID = clientDetails.pk.S.substring(5); // Skip over 'user#' prefix
                        const mobileNumber = convertToCountryPrefixFormat(clientDetails.phone.S);

                        await s4.recoverCognitoAccount(req, email, password, mobileNumber);

                        req.session.cognitoID = userID;
                        return res.redirect("/sign-in/enter-text-code-then-continue-recovery");
                    }
                }

                req.session.emailAddress = email;
                return res.redirect("/sign-in/account-not-found");
            }

            logger.debug("Unknown Error");
            throw error;
        }

        if (isFixedOTPCredential(email)) {
            req.session.password = password;
        }

        res.redirect("/sign-in/enter-text-code");
    };
}
