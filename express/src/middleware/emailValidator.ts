import {NextFunction, Request, Response} from "express";
import allowedEmailDomains from "../lib/allowedEmailDomains";
import isRfc822Compliant from "../lib/rfc822-validate";

type MiddlewareFunction<T, U, V> = (T: Request, U: Response, V: NextFunction) => void;

export function emailValidator(template: string): MiddlewareFunction<Request, Response, NextFunction> {
    return async (req: Request, res: Response, next: NextFunction) => {
        let emailAddress: string = req.body.emailAddress;

        emailAddress = emailAddress.trim();

        if (emailAddress === "" || emailAddress === undefined || emailAddress === null) {
            res.render(template, {errorMessages: {emailAddress: "Enter your email address"}});
            return;
        }

        if (!isRfc822Compliant(emailAddress)) {
            res.render(template, {
                errorMessages: {emailAddress: "Enter an email address in the correct format, like name@example.com"}
            });
            return;
        }

        if (!(await isAllowedDomain(emailAddress))) {
            res.render(template, {
                errorMessages: {message: `Disallowed domain: ${emailAddress}`, emailAddress: "Enter a government email address"}
            });
            return;
        }

        req.session.emailAddress = emailAddress;
        next();
    };
}

export async function isAllowedDomain(emailAddress: string): Promise<boolean> {
    return (await allowedEmailDomains).filter((domain: string) => emailAddress.endsWith(`${domain}`)).length > 0;
}
