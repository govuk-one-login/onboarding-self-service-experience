import {NextFunction, Request, Response} from "express";
import getAuthApiCompliantPublicKey from "../lib/publicKeyUtils";

export function convertPublicKeyForAuth(req: Request, res: Response, next: NextFunction) {
    if (req.body.serviceUserPublicKey === "") {
        res.render("service-details/change-public-key.njk", {
            serviceId: req.params.serviceId,
            selfServiceClientId: req.params.selfServiceClientId,
            clientId: req.params.clientId,
            errorMessages: {
                serviceUserPublicKey: "Enter a public key"
            }
        });
        return;
    }

    try {
        req.body.authCompliantPublicKey = getAuthApiCompliantPublicKey(req.body.serviceUserPublicKey as string);
    } catch (err) {
        console.error(err);
        res.render("service-details/change-public-key.njk", {
            serviceId: req.params.serviceId,
            selfServiceClientId: req.params.selfServiceClientId,
            clientId: req.params.clientId,
            errorMessages: {
                serviceUserPublicKey: "Enter a valid public key in PEM format, including the headers"
            },
            values: {serviceUserPublicKey: req.body.serviceUserPublicKey},
            serviceUserPublicKey: req.body.authCompliantPublicKey
        });
        return;
    }

    next();
}
