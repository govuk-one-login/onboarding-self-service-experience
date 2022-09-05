import {NextFunction, Request, Response} from "express";
import getAuthApiCompliantPublicKey from "../lib/publicKeyUtils";

export function convertPublicKeyForAuth(req: Request, res: Response, next: NextFunction) {
    try {
        req.body.authCompliantPublicKey = getAuthApiCompliantPublicKey(req.body.serviceUserPublicKey as string);
    } catch (err) {
        console.error(err);
        const errorMessages = new Map<string, string>();
        errorMessages.set("serviceUserPublicKey", "Enter a valid public key");
        res.render("dashboard/change-public-key.njk", {
            errorMessages: errorMessages,
            serviceId: req.params.serviceId,
            selfServiceClientId: req.params.selfServiceClientId,
            clientId: req.params.clientId
        });
        return;
    }

    next();
}
