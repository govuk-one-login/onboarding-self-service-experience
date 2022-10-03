import {CodeMismatchException} from "@aws-sdk/client-cognito-identity-provider";
import {NextFunction, Request, Response} from "express";
import SelfServiceServicesService from "../services/self-service-services-service";

export async function processLoginOtpMobile(req: Request, res: Response, next: NextFunction) {
    console.log("checking mobile");
    console.log(req.body);
    const s4: SelfServiceServicesService = req.app.get("backing-service");
    if (!req.body["sms-otp"]) {
        console.error("processLoginOtpMobile::OTP not provided, redirecting to /sign-in-otp-mobile");
        res.redirect("/sign-in-otp-mobile");
        return;
    }
    if (!req.session.mfaResponse) {
        console.log("processLoginOtpMobile::mfaResponse not in session, redirecting to /sign-in");
        res.redirect("/sign-in");
        return;
    }

    try {
        req.session.authenticationResult = await s4.respondToMfaChallenge(req.session.mfaResponse, req.body["sms-otp"]);
    } catch (error) {
        if (error instanceof CodeMismatchException) {
            res.render("common/check-mobile.njk", {
                errorMessages: {smsOtp: "The code you entered is not correct or has expired - enter it again or request a new code"},
                values: {
                    mobileNumber: req.session.mobileNumber as string,
                    formActionUrl: "/sign-in-otp-mobile"
                }
            });
            return;
        } else {
            throw error;
        }
    }

    next();
}
