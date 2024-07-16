import {NextFunction, Request, Response} from "express";
import getAuthApiCompliantPublicKey, {isPublicKeyValid, validateJwksURL} from "../lib/public-key";

export default function validateKeySource(req: Request, res: Response, next: NextFunction) {
    console.info("In convertPublicKeyForAuth()");
    console.info("req.body: " + JSON.stringify(req.body));
    console.info("req.path: " + JSON.stringify(req.path));
    console.info("req.params: " + JSON.stringify(req.params));
    var errorMessages;

    try {
        if (req.body.publicKeySource == "STATIC") {
            errorMessages = {serviceUserPublicKey: "Enter a valid public key"};
            req.body.update = {
                public_key_source: req.body.publicKeySource,
                public_key: getAuthApiCompliantPublicKey(isPublicKeyValid(req.body.serviceUserPublicKey))
            };
        } else if (req.body.publicKeySource == "JWKS") {
            errorMessages = {jwksUrl: "Enter a valid JWKs URL"};
            req.body.update = {
                public_key_source: req.body.publicKeySource,
                jwks_uri: validateJwksURL(req.body.jwksUrl)
            };
        }
    } catch (err) {
        console.error(err);
        return res.render("clients/change-public-key.njk", {
            serviceId: req.context.serviceId,
            selfServiceClientId: req.params.selfServiceClientId,
            clientId: req.params.clientId,
            errorMessages: errorMessages,
            publicKeySource: req.body.publicKeySource,
            serviceUserPublicKey: req.body.serviceUserPublicKey,
            jwksUrl: req.body.jwksUrl
        });
    }

    next();
}
