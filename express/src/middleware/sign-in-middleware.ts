import {CodeMismatchException} from "@aws-sdk/client-cognito-identity-provider";
import {NextFunction, Request, Response} from "express";
import SelfServiceServicesService from "../services/self-service-services-service";

export async function processLoginOtpMobile(req: Request, res: Response, next: NextFunction) {
    const s4: SelfServiceServicesService = req.app.get("backing-service");

    // TODO figure out error handling, maybe throw?
    if (!req.session.mfaResponse) {
        res.redirect("/sign-in");
        return;
    }

    try {
        req.session.authenticationResult = await s4.respondToMfaChallenge(req.session.mfaResponse, req.body["sms-otp"]);
    } catch (error) {
        if (error instanceof CodeMismatchException) {
            res.render("check-mobile.njk", {
                errorMessages: {
                    "sms-otp": "The code you entered is not correct or has expired - enter it again or request a new code"
                },
                values: {
                    "sms-otp": req.body["sms-otp"],
                    mobileNumber: req.session.mobileNumber as string,
                    formActionUrl: "/sign-in-otp-mobile"
                }
            });

            return;
        }

        throw error;
    }

    next();
}
