import {NextFunction, Request, Response} from "express";
import allowedEmailDomains from "../lib/allowedEmailDomains";

import isRfc822Compliant from "../lib/rfc822-validate";
import {SelfServiceError} from "../lib/SelfServiceError";

type MiddlewareFunction<T, U, V> = (T: Request, U: Response, V: NextFunction) => void;

export function emailValidator(template: { template: string }): MiddlewareFunction<Request, Response, NextFunction> {
    return async (req: Request, res: Response, next: NextFunction) => {
        let emailAddress: string = req.body.emailAddress;

        emailAddress = emailAddress.trim();

        if (emailAddress === "" || emailAddress === undefined || emailAddress === null) {
            throw new SelfServiceError("No email provided", {
                ...template,
                errorMessages: {emailAddress: 'Enter your email address'}
            });
        }

        if (!isRfc822Compliant(emailAddress)) {
            throw new SelfServiceError("Invalid email address", {
                ...template,
                errorMessages: {emailAddress: 'Enter an email address in the correct format, like name@example.com'}
            });
        }


        if (!await isAllowedDomain(emailAddress)) {
            throw new SelfServiceError(`Disallowed domain: ${emailAddress}`, {
                    ...template,
                    errorMessages: {emailAddress: 'Enter a government email address'}
                }
            );
        }

        req.session.emailAddress = emailAddress;
        next();
    }
}

export async function isAllowedDomain(emailAddress: string): Promise<boolean> {
    return (await allowedEmailDomains).filter((domain: string) => emailAddress.endsWith(`${domain}`)).length > 0;
}
