import {NextFunction, Request, Response} from "express";
import getAuthApiCompliantPublicKey from "../lib/public-key";

export default function convertPublicKeyForAuth(req: Request, res: Response, next: NextFunction) {
    try {
        req.body.authCompliantPublicKey = getAuthApiCompliantPublicKey(req.body.publicKey);
    } catch (ignored) {
        return res.render("clients/change-public-key.njk", {
            serviceId: req.params.serviceId,
            selfServiceClientId: req.params.selfServiceClientId,
            clientId: req.params.clientId,
            values: {
                publicKey: req.body.publicKey
            },
            errorMessages: {
                publicKey: "Enter a valid public key"
            }
        });
    }

    next();
}
