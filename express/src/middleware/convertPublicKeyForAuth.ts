import {NextFunction, Request, Response} from "express";
import getAuthApiCompliantPublicKey from "../lib/publicKeyUtils/public-key-utils";

export function convertPublicKeyForAuth(req: Request, res: Response, next: NextFunction) {

    try {
        req.body.authCompliantPublicKey =  getAuthApiCompliantPublicKey(req.body.serviceUserPublicKey as string);
    } catch (err) {
        console.log(err)
        const errorMessages = new Map<string, string>();
        errorMessages.set('serviceUserPublicKey', 'Enter a valid public key');
        res.render('dashboard/change-public-key.njk', {
            errorMessages: errorMessages, serviceId: req.params.serviceId,
            selfServiceClientId: req.params.selfServiceClientId,
            clientId: req.params.clientId
        });
        return;
    }
    next();
}