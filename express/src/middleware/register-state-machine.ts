import {NextFunction, Request, Response} from "express";

export default function checkRegisterRedirect(req: Request, res: Response, next: NextFunction) {
    console.info("State Machine: routing to Page => " + req.path);
    const emailAddress = req.session.emailAddress;
    const previousPath = req.session.previousPath as string;

    if (emailAddress && previousPath) {
        const currentPath = req.baseUrl + req.path;
        console.log("currentPath: " + currentPath + " previous path: " + previousPath);
        if (previousPath === currentPath) {
            console.log("paths are the same");
        }

        console.log("state machine says: " + registerStateMachine[currentPath]);

        if (!registerStateMachine[currentPath]?.includes(previousPath)) {
            //redirect to error page
            console.log("success");
        }
    } else {
        console.info("Processing no email address");
        // need to also check is not enter-email-address (maybs)
    }

    next();
}

export const getNextPaths = (req: Request) => {
    const currentPath = req.baseUrl + req.path;
    console.log("Getting next path for: " + currentPath);
    let nextPaths: string[] = [];

    if (!registerStateMachine[currentPath]) {
        console.log("not in state machine");
    } else {
        nextPaths = registerStateMachine[currentPath];
    }

    req.session.nextPaths = nextPaths;
    req.session.save();
};

export enum RegisterRoutes {
    enterEmailAddress = "/register/enter-email-address",
    enterEmailCode = "/register/enter-email-code",
    accountExists = "/register/account-exists",
    resendEmailCode = "/register/resend-email-code",
    createPassword = "/register/create-password",
    enterPhoneNumber = "/register/enter-phone-number",
    enterTextCode = "/register/enter-text-code",
    resendTextCode = "/register/resend-text-code",
    createService = "/register/create-service",
    resumeBeforePassword = "/register/resume-before-password",
    resumeAfterPassword = "/register/resume-after-password",
    tooManyCodes = "/register/too-many-codes"
}

const registerStateMachine: {[route: string]: string[]} = {
    [RegisterRoutes.enterEmailAddress]: [RegisterRoutes.enterEmailCode, RegisterRoutes.accountExists, RegisterRoutes.resumeBeforePassword, RegisterRoutes.resumeAfterPassword],
    [RegisterRoutes.enterEmailCode]: [RegisterRoutes.resendEmailCode, RegisterRoutes.createPassword, RegisterRoutes.tooManyCodes],
    [RegisterRoutes.resendEmailCode]: [RegisterRoutes.enterEmailCode, RegisterRoutes.tooManyCodes],
    [RegisterRoutes.createPassword]: [RegisterRoutes.enterPhoneNumber],
    [RegisterRoutes.enterPhoneNumber]: [RegisterRoutes.enterTextCode],
    [RegisterRoutes.enterTextCode]: [RegisterRoutes.createService, RegisterRoutes.resendTextCode],
    [RegisterRoutes.resendTextCode]: [RegisterRoutes.enterTextCode],
    [RegisterRoutes.resumeBeforePassword]: [RegisterRoutes.createPassword],
    [RegisterRoutes.resumeAfterPassword]: [RegisterRoutes.enterPhoneNumber],
    [RegisterRoutes.tooManyCodes]: [] //todo
};
