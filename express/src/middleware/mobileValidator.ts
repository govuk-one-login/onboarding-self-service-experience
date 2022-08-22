import {NextFunction, Request, Response} from "express";

type MiddlewareFunction<T, U, V> = (T: Request, U: Response, V: NextFunction) => void;
export function mobileValidator(render: string): MiddlewareFunction<Request, Response, NextFunction> {
    return async (req: Request, res: Response, next: NextFunction) =>
    {
        let mobileNumber = req.body.mobileNumber;
        mobileNumber = removeSpaceAndDash(mobileNumber);

        if ( mobileNumber === "" || mobileNumber === null ){
            errorResponse(render, mobileNumber, res , 'mobileNumber', 'Enter a mobile phone number');
            return;
        }

        if (!onlyNumbers(mobileNumber)){
            errorResponse(render, mobileNumber, res , 'mobileNumber', 'Enter a UK mobile phone number using numbers only');
            return;
        }

        if(!ukNumberCheck(mobileNumber)){
            errorResponse(render, mobileNumber, res , 'mobileNumber', 'Enter a UK mobile phone number, like 07700 900000');
            return;
        }
        if (beginsWith070(mobileNumber)) {
            errorResponse(render, mobileNumber, res , 'mobileNumber', 'We do not accept premium rate telephone numbers.');
            return;
        }

        mobileNumber = convert07Numbers(mobileNumber);

        if (!lengthCheck(mobileNumber)) {
            errorResponse(render, mobileNumber, res , 'mobileNumber', 'Your number contains an incorrect number of digits');
            return;
        }

        req.session.enteredMobileNumber = req.body.mobileNumber;
        req.session.mobileNumber = mobileNumber;
        next();

    }
}

export function removeSpaceAndDash(mobileNumber: string) {
    return mobileNumber.trim().replace(/ /g, "").replace(/-/g, "");
}

export function onlyNumbers(mobileNumber: string) {
    if ( mobileNumber.startsWith("+")) {
        mobileNumber = mobileNumber.split("+")[1];
    }
    return /^[0-9]*$/.test(mobileNumber);
}

export function ukNumberCheck(mobileNumber: string) {
    return mobileNumber.startsWith("07") || mobileNumber.startsWith("+44");
}

export function beginsWith070(mobileNumber: string) {
    return mobileNumber.startsWith("070") || mobileNumber.startsWith("+4470")
}

export function convert07Numbers(mobileNumber: string) {
    if (mobileNumber.startsWith("07")) {
        mobileNumber = "+44" + mobileNumber.substring(1);
    }
    return mobileNumber;
}

export function lengthCheck(mobileNumber: string) {
    if (mobileNumber.split("+44")[1].length !== 10) {
        return false;
    }
    return true;
}

export function errorResponse(render: string, mobileNumber: number, res: Response, key: string, message: string) {
    let errorMessages = new Map<string, string>();
    errorMessages.set(key, message);
    const value : object = {mobileNumber: mobileNumber};
    res.render(render, {
        errors: errorMessages,
        value: value
    });
}
