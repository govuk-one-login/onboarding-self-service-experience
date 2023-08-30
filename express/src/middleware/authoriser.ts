import {NextFunction, Request, Response} from "express";
import SelfServiceServicesService from "../services/self-service-services-service";

// TODO This only checks the user is signed in but doesn't check the user's permissions to view objects or do actions
export default async function checkAuthorisation(req: Request, res: Response, next: NextFunction) {
    const s4: SelfServiceServicesService = req.app.get("backing-service");
    // TODO only redirect to /session-timeout if the session is timed out - we need to have a way of checking this
    // TODO Otherwise, redirect to /sign-in
    if (!req.session.authenticationResult?.AccessToken) {
        s4.sendTxMALog({
            userIp: req.ip,
            event: 'ERROR_TIMEOUT',
            journeyId: req.session.id
        });

        return res.redirect("/session-timeout");
    }

    if (req.session.authenticationResult?.RefreshToken) {
        req.session.authenticationResult = await s4
            .useRefreshToken(req.session.authenticationResult.RefreshToken)
            .then(result => result.AuthenticationResult);
    }

    next();
}
