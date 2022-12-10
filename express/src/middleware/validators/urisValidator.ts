import {NextFunction, Request, Response} from "express";
import {validateUris} from "../../lib/validators/urisValidator";

type MiddlewareFunction<T, U, V> = (T: Request, U: Response, V: NextFunction) => void;

export function urisValidator(template: string): MiddlewareFunction<Request, Response, NextFunction> {
    return (req: Request, res: Response, next: NextFunction) => {
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
