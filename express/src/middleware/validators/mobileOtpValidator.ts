import {NextFunction, Request, Response} from "express";
import {obscureNumber} from "../../lib/mobileNumberUtils";
import {validateOtp} from "../../lib/validators/checkOtp";

type MiddlewareFunction<T, U, V> = (T: Request, U: Response, V: NextFunction) => void;

export function mobileOtpValidator(
    formActionUrl: string,
    textMessageNotReceivedUrl: string,
    hideNumber = false
): MiddlewareFunction<Request, Response, NextFunction> {
    return async (req: Request, res: Response, next: NextFunction) => {
        let otp: string = req.body["sms-otp"];
        otp = otp.trim();
        let mobileNumber;
        if (hideNumber) {
            mobileNumber = obscureNumber(getMobileNumber(req));
        } else {
            mobileNumber = String(req.session.enteredMobileNumber);
        }

        const validationResponse = validateOtp(otp);
        if (validationResponse.isValid) {
            next();
        } else {
            res.render("check-mobile.njk", {
                errorMessages: {smsOtp: validationResponse.errorMessage as string},
                value: {otp: otp},
                values: {
                    mobileNumber: mobileNumber,
                    formActionUrl: formActionUrl,
                    textMessageNotReceivedUrl: textMessageNotReceivedUrl
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
