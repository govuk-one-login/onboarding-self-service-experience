import {NextFunction, Request, Response} from "express";
import SelfServiceServicesService from "../services/self-service-services-service";
import {NotAuthorizedException, UserNotFoundException} from "@aws-sdk/client-cognito-identity-provider";

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
                errorMessages: {password: "Enter your password"}
            });
            return;
        }

        try {
            req.session.mfaResponse = await s4.login(email, password);
        } catch (error) {
            if (error instanceof NotAuthorizedException) {
                res.render(template, {
                    values: {
                        password: password,
                        emailAddress: email
                    },
                    errorMessages: {password: "Incorrect password"}
                });
                return;
            }

            if (error instanceof UserNotFoundException) {
                req.session.emailAddress = email;
                res.redirect("/no-account");
                return;
            }

            console.error(error);
            res.render("there-is-a-problem.njk");
            return;
        }

        res.redirect("/sign-in-otp-mobile");
        return;
    };
}
