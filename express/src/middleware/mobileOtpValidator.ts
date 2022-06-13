import {NextFunction, Request, Response} from "express";

export async function mobileOtpValidator(req: Request, res: Response, next: NextFunction) {
    let otp: string = req.body['create-sms-otp'];
    otp = otp.trim();
    const mobileNumber: string = String(req.session.mobileNumber);
    if (!sixDigits(otp)) {
        await errorResponse(otp, res, 'createSmsOtp', 'Enter the 6 digit security code', mobileNumber);
        return;
    }
    next();
}

export function errorResponse(otp: string, res: Response, key: string, message: string, mobileNumber: string) {
    const errorMessages = new Map<string, string>();
    const value : object = {otp: otp};
    errorMessages.set(key, message);
    res.render('create-account/check-mobile.njk', {
        errorMessages: errorMessages,
        value: value,
        mobileNumber: mobileNumber,
    });
}

export function sixDigits(otp: string) {
    return /^[0-9]{6}$/.test(otp);
}

