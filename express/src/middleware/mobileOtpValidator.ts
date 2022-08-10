import {NextFunction, Request, Response} from "express";

type MiddlewareFunction<T, U, V> = (T: Request, U: Response, V: NextFunction) => void;
export function mobileOtpValidator(isMobileHidden: boolean, formActionUrl: string): MiddlewareFunction<Request, Response, NextFunction> {
    return async (req: Request, res: Response, next: NextFunction) => {
        let otp: string = req.body['sms-otp'];
        otp = otp.trim();
        let mobileNumber: string;
        if (isMobileHidden) {
            const mobileNumberRaw = String(req.session.mobileNumber);
            const mobileNumberLast4Digits = mobileNumberRaw.slice(-4);
            mobileNumber = '*******' + mobileNumberLast4Digits;
        } else  {
            mobileNumber = String(req.session.mobileNumber);
        }

        if (otp === "") {
            await errorResponse(otp, res, 'smsOtp', 'Enter the 6 digit security code', mobileNumber, formActionUrl);
            return;
        }

        if (!sixCharacters(otp)) {
            await errorResponse(otp, res, 'smsOtp', 'Enter the security code using only 6 digits', mobileNumber, formActionUrl);
            return;
        }

        if (!sixDigits(otp)) {
            await errorResponse(otp, res, 'smsOtp', 'Your security code should only include numbers', mobileNumber, formActionUrl);
            return;
        }
        next();
    }
}

export function errorResponse(otp: string, res: Response, key: string, message: string, mobileNumber: string, formActionUrl: string) {
    const errorMessages = new Map<string, string>();
    const value : object = {otp: otp};
    errorMessages.set(key, message);
    res.render('common/check-mobile.njk', {
        errorMessages: errorMessages,
        value: value,
        mobileNumber: mobileNumber,
        formActionUrl: formActionUrl
    });
}

export function sixDigits(otp: string) {
    return /^[0-9]{6}$/.test(otp);
}

export function sixCharacters(otp: string) {
    return /^.{6}$/.test(otp);
}

