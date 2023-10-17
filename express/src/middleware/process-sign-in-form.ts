import {NotAuthorizedException, UserNotFoundException} from "@aws-sdk/client-cognito-identity-provider";
import {RequestHandler} from "express";
import SelfServiceServicesService from "../services/self-service-services-service";

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
            if (error instanceof NotAuthorizedException) {
                await s4.sendTxMALog(
                    JSON.stringify({
                        userIp: req.ip,
                        event: "INVALID_CREDENTIAL",
                        journeyId: req.session.id,
                        credentialType: "password"
                    })
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
                req.session.emailAddress = email;
                return res.redirect("/sign-in/account-not-found");
            }

            throw error;
        }

        res.redirect("/sign-in/enter-text-code");
    };
}
