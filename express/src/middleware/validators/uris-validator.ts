import {RequestHandler} from "express";
import validate from "../../lib/validators/uris-validator";

export default function validateUris(template: string): RequestHandler {
    console.info("In validateUris()");

    return (req, res, next) => {
        const uris: string = req.body.redirectUris;
        const result = validate(uris.split(" ").filter(url => url.length > 0));

        if (result.isValid) {
            return next();
        }

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
    };
}
