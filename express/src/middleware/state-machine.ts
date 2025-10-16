import {Request, Response} from "express";

export const getNextPathsAndRedirect = (req: Request, res: Response, redirectPath: string) => {
    const currentPath = req.baseUrl + req.path;
    console.log("Getting next path for: " + currentPath);
    let nextPaths: string[] = [];

    if (!stateMachine[currentPath]) {
        console.log(currentPath + " is not in state machine");
    } else {
        nextPaths = stateMachine[currentPath];
    }

    req.session.nextPaths = nextPaths;
    req.session.save();
    res.redirect(redirectPath);
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

export enum AccountRoutes {
    showAccount = "/account/",
    changePassword = "/account/change-password",
    changePhoneNumber = "/account/change-phone-number",
    enterTextCode = "/account/change-phone-number/enter-text-code",
    resendTextCode = "/account/change-phone-number/resend-text-code"
}

export enum SignInRoutes {
    enterEmailAddress = "/sign-in/enter-email-address",
    enterEmailAddressGlobalSignOut = "/sign-in/enter-email-address-global-sign-out",
    enterPassword = "/sign-in/enter-password",
    passwordResendTextCode = "/sign-in/resend-text-code/enter-password",
    enterTextCode = "/sign-in/enter-text-code",
    enterTextCodeContinueRecovery = "/sign-in/enter-text-code-then-continue-recovery",
    resendTextCode = "/sign-in/resend-text-code",
    accountNotFound = "/sign-in/account-not-found",
    signedInToAnotherAccount = "/sign-in/signed-in-to-another-device",
    globalSignOut = "/sign-in/global-sign-out",
    forgotPassword = "/sign-in/forgot-password",
    forgotPasswordEnterEmailCode = "/sign-in/forgot-password/enter-email-code",
    forgotPasswordCreatePassword = "/sign-in/forgot-password/create-new-password",
    forgotPasswordCreatePasswordContinueRecovery = "/sign-in/forgot-password/create-new-password-then-continue-recovery",
    forgotPasswordContinueRecovery = "/sign-in/forgot-password/continue-recovery"
}

export enum ServicesRoutes {
    listServices = "/services/",
    addNewService = "/services/add-new-service"
}

// currentPath and the list of paths they are allowed to navigate to
const stateMachine: {[route: string]: string[]} = {
    [RegisterRoutes.enterEmailAddress]: [
        RegisterRoutes.enterEmailCode,
        RegisterRoutes.accountExists,
        RegisterRoutes.resumeBeforePassword,
        RegisterRoutes.resumeAfterPassword
    ],
    [RegisterRoutes.enterEmailCode]: [RegisterRoutes.resendEmailCode, RegisterRoutes.createPassword, RegisterRoutes.tooManyCodes],
    [RegisterRoutes.resendEmailCode]: [RegisterRoutes.enterEmailCode, RegisterRoutes.tooManyCodes],
    [RegisterRoutes.createPassword]: [RegisterRoutes.enterPhoneNumber],
    [RegisterRoutes.enterPhoneNumber]: [RegisterRoutes.enterTextCode],
    [RegisterRoutes.enterTextCode]: [RegisterRoutes.createService, RegisterRoutes.resendTextCode],
    [RegisterRoutes.resendTextCode]: [RegisterRoutes.enterTextCode],
    [RegisterRoutes.resumeBeforePassword]: [RegisterRoutes.resendEmailCode, RegisterRoutes.createPassword, RegisterRoutes.tooManyCodes],
    [RegisterRoutes.resumeAfterPassword]: [RegisterRoutes.enterPhoneNumber],
    [SignInRoutes.enterEmailAddress]: [RegisterRoutes.resumeAfterPassword, RegisterRoutes.resumeBeforePassword],
    [ServicesRoutes.listServices]: [RegisterRoutes.createService],
    [SignInRoutes.enterTextCode]: [RegisterRoutes.createService]
};
