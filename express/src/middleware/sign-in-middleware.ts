import {CodeMismatchException} from "@aws-sdk/client-cognito-identity-provider";
import {NextFunction, Request, Response} from "express";
import SelfServiceErrors from "../lib/errors";
import SelfServiceError from "../lib/self-service-error";
import SelfServiceServicesService from "../services/self-service-services-service";

export async function processLoginOtpMobile(req: Request, res: Response, next: NextFunction) {
    console.log("checking mobile");
    console.log(req.body);
    const s4: SelfServiceServicesService = req.app.get("backing-service");
    if (!req.body["sms-otp"]) {
        console.log("OTP not provided");
        next(SelfServiceErrors.Redirect("/sign-in-otp-mobile"));
    }
    if (!req.session.cognitoUser || !req.session.cognitoSession) {
        next(SelfServiceErrors.Redirect("/sign-in"));
    }

    try {
        req.session.authenticationResult = await s4.respondToMfaChallenge(
            req.session.cognitoUser?.Username as string,
            req.body["sms-otp"],
            req.session.cognitoSession as string
        );
    } catch (error) {
        if (error instanceof CodeMismatchException) {
            throw new SelfServiceError("Wrong OTP entered for login", {
                template: "common/check-mobile.njk",
                errorMessages: {smsOtp: "The code you entered is not correct or has expired - enter it again or request a new code"},
                values: {
                    mobileNumber: req.session.mobileNumber as string,
                    formActionUrl: "/sign-in-otp-mobile"
                }
            });
        } else {
            throw error;
        }
    }

    next();
}
