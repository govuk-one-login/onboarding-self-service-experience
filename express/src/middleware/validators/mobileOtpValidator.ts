import {NextFunction, Request, Response} from "express";
import {obscureNumber} from "../../lib/mobileNumberUtils";
import {validateSecurityCode} from "../../lib/validators/checkOtp";

type MiddlewareFunction<T, U, V> = (T: Request, U: Response, V: NextFunction) => void;

export function mobileSecurityCodeValidator(
    textMessageNotReceivedUrl: string,
    hideNumber = true
): MiddlewareFunction<Request, Response, NextFunction> {
    return async (req: Request, res: Response, next: NextFunction) => {
        const securityCode: string = req.body.securityCode.trim();
        let mobileNumber;

        if (hideNumber) {
            mobileNumber = obscureNumber(getMobileNumber(req));
        } else {
            mobileNumber = String(req.session.enteredMobileNumber);
        }

        const validationResponse = validateSecurityCode(securityCode);
        if (validationResponse.isValid) {
            next();
        } else {
            res.render("common/check-mobile.njk", {
                values: {
                    securityCode: securityCode,
                    mobileNumber: mobileNumber,
                    textMessageNotReceivedUrl: textMessageNotReceivedUrl
                },
                errorMessages: {
                    securityCode: validationResponse.errorMessage
                }
            });
        }
    };
}

function getMobileNumber(req: Request): string {
    if (req.session?.mfaResponse?.codeSentTo) {
        return req.session.mfaResponse.codeSentTo;
    } else {
        return (req.session.enteredMobileNumber as string) || (req.session.mobileNumber as string);
    }
}
