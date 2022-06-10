import {NextFunction, Request, Response} from "express";

export function mobileValidator(req: Request, res: Response, next: NextFunction) {
    let mobileNumber = req.body.mobileNumber;
    mobileNumber = removeSpaceAndDash(mobileNumber);

    if ( mobileNumber === "" || mobileNumber === null ){
        errorResponse(mobileNumber, res , 'mobileNumber', 'Mobile number is required');
        return;
    }
    
    if (!onlyNumbers(mobileNumber)){
        errorResponse(mobileNumber, res , 'mobileNumber', 'Make sure there are no letters in the mobile number.');
        return;
    }

    if(!ukNumberCheck(mobileNumber)){
        errorResponse(mobileNumber, res , 'mobileNumber', 'Make sure you have enterd a correct UK phone number .');
        return;
    }
    if (beginsWith070(mobileNumber)) {
        errorResponse(mobileNumber, res , 'mobileNumber', 'We do not accept premium rate telephone numbers.');
        return;
    }

    mobileNumber = convert07Numbers(mobileNumber);

    if (!lengthCheck(mobileNumber)) {
        errorResponse(mobileNumber, res , 'mobileNumber', 'Your number contains an incorrect number of digits');
        return;
    }

    req.session.mobileNumber = mobileNumber;
    next();

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

export function errorResponse(mobileNumber: number, res: Response, key: string, message: string) {
    let errorMessages = new Map<string, string>();
    errorMessages.set(key, message);
    const value : object = {mobileNumber: mobileNumber};
    res.render('create-account/enter-mobile.njk', {
        errors: errorMessages,
        value: value
    });
}
