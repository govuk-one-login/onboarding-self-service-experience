import {NextFunction, Request, Response} from "express";
import getAuthApiCompliantPublicKey, {isPublicKeyValid} from "../lib/public-key";

export default function convertPublicKeyForAuth(req: Request, res: Response, next: NextFunction) {
    console.info("In convertPublicKeyForAuth()");

    try {
        req.body.authCompliantPublicKey = getAuthApiCompliantPublicKey(isPublicKeyValid(req.body.serviceUserPublicKey));
    } catch (err) {
        console.error(err);
        return res.render("clients/change-public-key.njk", {
            serviceId: req.context.serviceId,
            selfServiceClientId: req.params.selfServiceClientId,
            clientId: req.params.clientId,
            errorMessages: {
                serviceUserPublicKey: "Enter a valid public key"
            },
            serviceUserPublicKey: req.query.publicKey
        });
    }

    next();
}
