import {NextFunction, Request, Response} from "express";

type MiddlewareFunction<T, U, V> = (T: Request, U: Response, V: NextFunction) => void;
export function mobileOtpValidator(render: string, isMobileHidden: boolean): MiddlewareFunction<Request, Response, NextFunction> {
    return async (req: Request, res: Response, next: NextFunction) => {
        let otp: string = req.body['create-sms-otp'];
        otp = otp.trim();
        let mobileNumber: string;
        if (isMobileHidden) {
            const mobileNumberRaw = String(req.session.mobileNumber);
            const mobileNumberLast4Digits = mobileNumberRaw.slice(-4);
            mobileNumber = '*******' + mobileNumberLast4Digits;
        } else  {
            mobileNumber = String(req.session.mobileNumber);
        }

        if (!sixDigits(otp)) {
            await errorResponse(render,otp, res, 'createSmsOtp', 'Enter the 6 digit security code', mobileNumber);
            return;
        }
        next();
    }
}

export function errorResponse(render:string, otp: string, res: Response, key: string, message: string, mobileNumber: string) {
    const errorMessages = new Map<string, string>();
    const value : object = {otp: otp};
    errorMessages.set(key, message);
    res.render(render, {
        errorMessages: errorMessages,
        value: value,
        mobileNumber: mobileNumber,
    });
}

export function sixDigits(otp: string) {
    return /^[0-9]{6}$/.test(otp);
}

