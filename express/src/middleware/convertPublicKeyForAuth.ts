import {NextFunction, Request, Response} from "express";
import getAuthApiCompliantPublicKey from "../lib/publicKeyUtils";

export function convertPublicKeyForAuth(req: Request, res: Response, next: NextFunction) {
    try {
        req.body.authCompliantPublicKey = getAuthApiCompliantPublicKey(req.body.serviceUserPublicKey as string);
    } catch (err) {
        console.error(err);
        res.render("clients/change-public-key.njk", {
            serviceId: req.params.serviceId,
            selfServiceClientId: req.params.selfServiceClientId,
            clientId: req.params.clientId,
            errorMessages: {
                serviceUserPublicKey: "Enter a valid public key"
            },
            serviceUserPublicKey: req.body.authCompliantPublicKey
        });

        return;
    }

    next();
}
