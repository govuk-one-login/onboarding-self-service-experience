import {NextFunction, Request, Response} from "express";

export default async function checkRegisterRedirect(req: Request, res: Response, next: NextFunction) {
    console.info("State Machine: routing to Page => " + req.path);
    const emailAddress = req.session.emailAddress;
    const previousPath = req.session.previousPath as string;

    if (emailAddress && previousPath) {
        const currentPath = req.baseUrl + req.path;
        console.log("currentPath: " + currentPath + " previous path: " + previousPath);
        if (previousPath === currentPath) {
            console.log("paths are the same");
            next(); // does not exit out
        }

        console.log("state machine says: " + registerStateMachine[currentPath]);

        if (!registerStateMachine[currentPath]?.includes(previousPath)) {
            //redirect to error page
            console.log("success");
        }
    } else {
        console.info("Processing no email address");
        return res.redirect(RegisterRoutes.enterEmailAddress);
    }

    next();
}

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
    resumeAfterPassword = "/register/resume-after-password"
}

const registerStateMachine: {[route: string]: string[]} = {
    [RegisterRoutes.enterEmailCode]: [RegisterRoutes.enterEmailAddress, RegisterRoutes.resendEmailCode],
    [RegisterRoutes.accountExists]: [RegisterRoutes.enterEmailAddress],
    [RegisterRoutes.resendEmailCode]: [RegisterRoutes.enterEmailCode],
    [RegisterRoutes.createPassword]: [RegisterRoutes.enterEmailCode, RegisterRoutes.resumeBeforePassword],
    [RegisterRoutes.enterPhoneNumber]: [RegisterRoutes.createPassword, RegisterRoutes.resumeAfterPassword],
    [RegisterRoutes.enterTextCode]: [RegisterRoutes.enterPhoneNumber, RegisterRoutes.resendTextCode],
    [RegisterRoutes.resendTextCode]: [RegisterRoutes.enterTextCode],
    [RegisterRoutes.createService]: [RegisterRoutes.enterTextCode, "/services"],
    [RegisterRoutes.resumeBeforePassword]: [RegisterRoutes.enterEmailAddress, "/sign-in/enter-email-address"],
    [RegisterRoutes.resumeAfterPassword]: [RegisterRoutes.enterEmailAddress, "/sign-in/enter-email-address"]
};
