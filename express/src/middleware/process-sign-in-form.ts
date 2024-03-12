import {NotAuthorizedException, UserNotFoundException} from "@aws-sdk/client-cognito-identity-provider";
import {RequestHandler} from "express";
import SelfServiceServicesService from "../services/self-service-services-service";
import console from "console";
import {convertToCountryPrefixFormat} from "../lib/mobile-number";
import * as process from "process";
import {isFixedCredential} from "../lib/fixedOTPSupport";

export default function processSignInForm(template: string): RequestHandler {
    console.info("In processSignInForm()");

    return async (req, res) => {
        const email = req.session.emailAddress as string;
        const password = req.body.password;
        const s4: SelfServiceServicesService = req.app.get("backing-service");

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
            console.log(JSON.stringify(error));

            if (error instanceof NotAuthorizedException) {
                console.log("NotAuthorizedException");

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
                console.log("UserNotFoundException");

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

            console.log("Unknown Error");
            throw error;
        }

        if (isFixedCredential(email)) {
            req.session.password = password;
        }

        res.redirect("/sign-in/enter-text-code");
    };
}
