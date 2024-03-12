import {CodeMismatchException, NotAuthorizedException} from "@aws-sdk/client-cognito-identity-provider";
import {NextFunction, Request, Response} from "express";
import SelfServiceServicesService from "../services/self-service-services-service";
import {isFixedCredential, respondToMFAChallengeForFixedOTPCredential} from "../lib/fixedOTPSupport";
import console from "console";

export default async function processSecurityCode(req: Request, res: Response, next: NextFunction) {
    console.info("In processSecurityCode()");

    const s4: SelfServiceServicesService = req.app.get("backing-service");

    // TODO figure out error handling, maybe throw?
    if (!req.session.mfaResponse) {
        return res.redirect("/sign-in");
    }

    try {
        const userName = req.session.emailAddress as string;
        const securityCode = req.body.securityCode;

        if (isFixedCredential(userName)) {
            const userPassword: string = req.session.password as string;

            respondToMFAChallengeForFixedOTPCredential(userName, securityCode);

            // As this is a Test User we want to ignore MFA Code so temporarily reset MFA to get Authentication Result.
            await s4.resetMfaPreference(userName);

            const response = await s4.submitUsernamePassword(userName, userPassword);
            req.session.cognitoSession = response.Session;
            req.session.authenticationResult = response.AuthenticationResult;

            // Now reset MFA Preferences to ensure Account remains 'pure' in term sof normal accounts.
            await s4.setMfaPreference(userName);
        } else {
            req.session.authenticationResult = await s4.respondToMfaChallenge(req.session.mfaResponse, securityCode);
        }
    } catch (error) {
        if (error instanceof CodeMismatchException) {
            s4.sendTxMALog(
                "SSE_INVALID_CREDENTIAL",
                {
                    email: req.session.emailAddress,
                    session_id: req.session.id,
                    ip_address: req.ip
                },
                {
                    credential_type: "2FA"
                }
            );

            return res.render("common/enter-text-code.njk", {
                headerActiveItem: "sign-in",
                errorMessages: {
                    securityCode: "The code you entered is not correct or has expired - enter it again or request a new code"
                },
                values: {
                    securityCode: req.body.securityCode,
                    mobileNumber: req.session.mobileNumber
                }
            });
        } else if (error instanceof NotAuthorizedException) {
            return res.render("common/enter-text-code.njk", {
                headerActiveItem: "sign-in",
                errorMessages: {
                    securityCode: "The code you entered is not correct or has expired - enter it again or request a new code"
                },
                values: {
                    securityCode: req.body.securityCode,
                    mobileNumber: req.session.mobileNumber
                }
            });
        }

        throw error;
    }

    next();
}
