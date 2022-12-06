import {NextFunction, Request, Response} from "express";
import {validateUris} from "../../lib/validators/urisValidator";
import {validationResult} from "../../lib/validators/validationResult";

type MiddlewareFunction<T, U, V> = (T: Request, U: Response, V: NextFunction) => void;

export function urisValidator(template: string, whichUris: string): MiddlewareFunction<Request, Response, NextFunction> {
    return async (req: Request, res: Response, next: NextFunction) => {
        const stringOfUris = req.body[whichUris];
        const result: validationResult = validateUris(stringOfUris.split(" ").filter((url: string) => url !== ""));

        if (result.isValid) {
            next();
        } else {
            res.render(template, {
                errorMessages: whichUris === "redirectUris" ? {redirectUris: result.errorMessage} : {postLogoutUris: result.errorMessage},
                values: {
                    redirectURIs: req.body[whichUris],
                    postLogoutURIs: req.body[whichUris],
                    serviceId: req.params.serviceId,
                    selfServiceClientId: req.params.selfServiceClientId,
                    clientId: req.params.clientId
                }
            });
        }
    };
}
