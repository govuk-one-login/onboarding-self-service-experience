import {RequestHandler} from "express";
import validate from "../../lib/validators/uri-validator";
import logger from "../../lib/logger";

export default function validateUri(template: string, uriBodyField: string, isGovUrl = false, allowEmptyValue = false): RequestHandler {
    logger.debug("In validateUri()");

    return (req, res, next) => {
        const uri: string = req.body[uriBodyField];
        const result = validate(uri, isGovUrl, allowEmptyValue);

        if (result.isValid) {
            return next();
        }
        res.render(template, {
            serviceId: req.context.serviceId,
            selfServiceClientId: req.params.selfServiceClientId,
            clientId: req.params.clientId,
            values: {
                [uriBodyField]: uri
            },
            errorMessages: {
                [uriBodyField]: result.errorMessage
            }
        });
    };
}
