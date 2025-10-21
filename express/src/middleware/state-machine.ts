import {Request, Response} from "express";

export const getNextPathsAndRedirect = (req: Request, res: Response, redirectPath: string) => {
    const currentPath = req.baseUrl + req.path;
    console.log("Getting next path for: " + currentPath);
    let nextPaths: string[] = [];
    let optionalPaths;

    if (!stateMachine[currentPath]) {
        console.log(currentPath + " is not in state machine");
    } else {
        nextPaths = stateMachine[currentPath].expectedUserJourney;
        optionalPaths = stateMachine[currentPath].optionalUserJourney;
    }

    req.session.nextPaths = nextPaths;
    req.session.optionalPaths = optionalPaths;
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

type Routes = ServicesRoutes | SignInRoutes | AccountRoutes | RegisterRoutes;

type UserJourneys = {
    expectedUserJourney: Routes[];
    optionalUserJourney?: Routes[];
};

// currentPath and the list of paths they are allowed to navigate to
const stateMachine: {[route: string]: UserJourneys} = {
    [RegisterRoutes.enterEmailAddress]: {
        expectedUserJourney: [RegisterRoutes.enterEmailCode],
        optionalUserJourney: [
            RegisterRoutes.accountExists,
            RegisterRoutes.resumeBeforePassword,
            RegisterRoutes.resumeAfterPassword,
            RegisterRoutes.resendEmailCode
        ]
    },
    [RegisterRoutes.enterEmailCode]: {
        expectedUserJourney: [RegisterRoutes.createPassword],
        optionalUserJourney: [RegisterRoutes.tooManyCodes]
    },
    [RegisterRoutes.resendEmailCode]: {
        expectedUserJourney: [RegisterRoutes.enterEmailCode],
        optionalUserJourney: [RegisterRoutes.resendEmailCode, RegisterRoutes.tooManyCodes]
    },
    [RegisterRoutes.createPassword]: {
        expectedUserJourney: [RegisterRoutes.enterPhoneNumber]
    },
    [RegisterRoutes.enterPhoneNumber]: {
        expectedUserJourney: [RegisterRoutes.enterTextCode],
        optionalUserJourney: [RegisterRoutes.resendTextCode, RegisterRoutes.enterPhoneNumber]
    },
    [RegisterRoutes.enterTextCode]: {
        expectedUserJourney: [RegisterRoutes.createService]
    },
    [RegisterRoutes.resendTextCode]: {
        expectedUserJourney: [RegisterRoutes.enterTextCode],
        optionalUserJourney: [RegisterRoutes.resendTextCode, RegisterRoutes.enterPhoneNumber]
    },
    [RegisterRoutes.resumeBeforePassword]: {
        expectedUserJourney: [RegisterRoutes.createPassword],
        optionalUserJourney: [RegisterRoutes.tooManyCodes]
    },
    [RegisterRoutes.resumeAfterPassword]: {
        expectedUserJourney: [RegisterRoutes.enterPhoneNumber]
    },
    [SignInRoutes.enterEmailAddress]: {
        expectedUserJourney: [SignInRoutes.enterPassword],
        optionalUserJourney: [RegisterRoutes.resumeAfterPassword, RegisterRoutes.resumeBeforePassword, RegisterRoutes.resendEmailCode]
    },
    [SignInRoutes.enterTextCode]: {
        expectedUserJourney: [],
        optionalUserJourney: [RegisterRoutes.createService]
    },
    [ServicesRoutes.listServices]: {
        expectedUserJourney: [],
        optionalUserJourney: [RegisterRoutes.createService]
    }
};
