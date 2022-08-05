import {NextFunction, Request, Response} from "express";
import allowedEmailDomains from "../lib/allowedEmailDomains";

import isRfc822Compliant from "../lib/rfc822-validate";

type MiddlewareFunction<T, U, V> = (T: Request, U: Response, V: NextFunction) => void;

export function emailValidator(render: string): MiddlewareFunction<Request, Response, NextFunction> {
    return async (req: Request, res: Response, next: NextFunction) => {
        let emailAddress: string = req.body.emailAddress;

        emailAddress = emailAddress.trim();

        if (emailAddress === "" || emailAddress === undefined || emailAddress === null) {
            await errorResponse(render, emailAddress, res, 'emailAddress', 'Enter your email address');
            return;
        }

        if (!isRfc822Compliant(emailAddress)) {
            await errorResponse(render, emailAddress, res, 'emailAddress', 'Enter an email address in the correct format, like name@example.com');
            return;
        }

        if (!await isAllowedDomain(emailAddress)) {
            await errorResponse(render, emailAddress, res, 'emailAddress', 'Enter a government email address');
            return;
        }

        req.session.emailAddress = emailAddress;
        next();
    }
}

export function errorResponse(render: string, emailAddress: string, res: Response, key: string, message: string) {
    const errorMessages = new Map<string, string>();
    errorMessages.set(key, message);
    let values = new Map();
    values.set(key, emailAddress);
    res.render(render, {
        errorMessages: errorMessages,
        values: values
    });
}

export async function isAllowedDomain(emailAddress: string): Promise<boolean> {
    return (await allowedEmailDomains).filter((domain: string) => emailAddress.endsWith(`${domain}`)).length > 0;
}
