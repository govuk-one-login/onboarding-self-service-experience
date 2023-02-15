import {NextFunction, Request, Response} from "express";
import SelfServiceServicesService from "../services/self-service-services-service";
import {NotAuthorizedException, UserNotFoundException} from "@aws-sdk/client-cognito-identity-provider";
import _ from "lodash";

type MiddlewareFunction<T, U, V> = (T: Request, U: Response, V: NextFunction) => void;

export default function processSignInForm(template: string): MiddlewareFunction<Request, Response, NextFunction> {
    return async (req: Request, res: Response, next: NextFunction) => {
        const email = req.session.emailAddress as string;
        const password = req.body.password;
        const s4: SelfServiceServicesService = req.app.get("backing-service");

        if (password.length === 0) {
            res.render(template, {
                values: {
                    password: password,
                    emailAddress: email
                },
                errorMessages: {
                    password: "Enter your password"
                }
            });

            return;
        }

        try {
            req.session.mfaResponse = await s4.login(email, password);
            if (!req.session.mfaResponse.codeSentTo) {
                const submitUserPassRes = Promise.resolve(await s4.submitUsernamePassword(email, password)).then(value => {
                    req.session.authenticationResult = value.AuthenticationResult;
                    return value.AuthenticationResult;
                });
                req.session.authenticationResult = await submitUserPassRes;
                const username = await s4.getUserByEmail(email);
                const isPhoneVerified = _.find(username.UserAttributes, {Name: "phone_number_verified", Value: "true"});
                if (!isPhoneVerified) {
                    res.redirect("/create/enter-mobile");
                    return;
                }
                res.redirect("/sign-in-otp-mobile");
                return;
            }
        } catch (error) {
            if (error instanceof NotAuthorizedException) {
                res.render(template, {
                    values: {
                        password: password,
                        emailAddress: email
                    },
                    errorMessages: {
                        password: "Incorrect password"
                    }
                });

                return;
            }

            if (error instanceof UserNotFoundException) {
                req.session.emailAddress = email;
                res.redirect("/no-account");
                return;
            }

            throw error;
        }
        res.redirect("/sign-in-otp-mobile");
        return;
    };
}