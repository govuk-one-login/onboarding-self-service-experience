import {NextFunction, Request, Response} from "express";

type MiddlewareFunction<T, U, V> = (T: Request, U: Response, V: NextFunction) => void;

export function urisValidator(template: string, whichUris: string): MiddlewareFunction<Request, Response, NextFunction> {
    return async (req: Request, res: Response, next: NextFunction) => {
        const stringOfUris = req.body[whichUris];
        if (stringOfUris === "") {
            const errorMessages = new Map<string, string>();
            errorMessages.set(whichUris, "Enter your redirect URIs");
            res.render(template, {
                errorMessages: errorMessages,
                value: req.body[whichUris],
                serviceId: req.params.serviceId,
                selfServiceClientId: req.params.selfServiceClientId,
                clientId: req.params.clientId
            });
            return;
        }
        const urlStrings = stringOfUris.split(" ").filter((url: string) => url !== "");
        const invalidUris: string[] = [];

        for (const url of urlStrings) {
            try {
                new URL(url);
            } catch (error) {
                invalidUris.push(url);
            }
        }

        if (invalidUris.length > 0) {
            const errorMessages = new Map<string, string>();
            if (invalidUris.length == 1) {
                errorMessages.set(whichUris, `${invalidUris[0]} is not a valid URL`);
            } else {
                errorMessages.set(whichUris, `The following URLs are not valid: ${invalidUris.join(" ")}`);
            }
            res.render(template, {
                errorMessages: errorMessages,
                value: req.body[whichUris],
                serviceId: req.params.serviceId,
                selfServiceClientId: req.params.selfServiceClientId,
                clientId: req.params.clientId
            });
            return;
        }

        for (const url of urlStrings) {
            const errorMessages = new Map<string, string>();
            errorMessages.set(whichUris, "URLs must be https (except for localhost)");

            const newUrl = new URL(url);
            if (!isValidLocalHost(newUrl) && newUrl.protocol !== "https:") {
                res.render(template, {
                    errorMessages: errorMessages,
                    value: req.body[whichUris],
                    serviceId: req.params.serviceId,
                    selfServiceClientId: req.params.selfServiceClientId,
                    clientId: req.params.clientId
                });
                return;
            }
        }

        next();
    };
}

function isValidLocalHost(url: URL): boolean {
    return url.hostname === "localhost" && (url.protocol === "http:" || url.protocol === "https:");
}
