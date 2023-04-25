import {RequestHandler} from "express";
import validateUris from "../../lib/validators/uris-validator";

export function urisValidator(template: string): RequestHandler {
    return (req, res, next) => {
        const uris: string = req.body.redirectUris;
        const result = validateUris(uris.split(" ").filter(url => url.length > 0));

        if (result.isValid) {
            next();
        } else {
            res.render(template, {
                serviceId: req.params.serviceId,
                selfServiceClientId: req.params.selfServiceClientId,
                clientId: req.params.clientId,
                values: {
                    redirectUris: req.body.redirectUris
                },
                errorMessages: {
                    redirectUris: result.errorMessage
                }
            });
        }
    };
}
