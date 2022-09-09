import {NextFunction, Request, Response} from "express";
import SelfServiceServicesService from "../services/self-service-services-service";

export async function checkAuthorisation(req: Request, res: Response, next: NextFunction) {
    if (!req.session.authenticationResult?.AccessToken) {
        res.render("sign-in.njk", {values: new Map<string, string>(), errorMessages: new Map<string, string>()});
    } else {
        if (req.session.authenticationResult?.RefreshToken) {
            const s4: SelfServiceServicesService = req.app.get("backing-service");
            req.session.authenticationResult = (
                await s4.useRefreshToken(req.session.authenticationResult.RefreshToken as string)
            ).AuthenticationResult;
        }
        next();
    }
}
