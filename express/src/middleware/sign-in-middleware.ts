import {CodeMismatchException} from "@aws-sdk/client-cognito-identity-provider";
import {NextFunction, Request, Response} from "express";
import SelfServiceServicesService from "../services/self-service-services-service";

export async function processSecurityCode(req: Request, res: Response, next: NextFunction) {
    const s4: SelfServiceServicesService = req.app.get("backing-service");

    // TODO figure out error handling, maybe throw?
    if (!req.session.mfaResponse) {
        res.redirect("/sign-in");
        return;
    }

    try {
        req.session.authenticationResult = await s4.respondToMfaChallenge(req.session.mfaResponse, req.body.securityCode);
    } catch (error) {
        if (error instanceof CodeMismatchException) {
            res.render("common/check-mobile.njk", {
                headerActiveItem: "sign-in",
                errorMessages: {
                    securityCode: "The code you entered is not correct or has expired - enter it again or request a new code"
                },
                values: {
                    securityCode: req.body.securityCode,
                    mobileNumber: req.session.mobileNumber
                }
            });

            return;
        }

        throw error;
    }

    next();
}
