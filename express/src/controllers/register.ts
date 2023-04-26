import {
    AuthenticationResultType,
    CodeMismatchException,
    NotAuthorizedException,
    UsernameExistsException
} from "@aws-sdk/client-cognito-identity-provider";
import {randomUUID} from "crypto";
import {NextFunction, Request, Response} from "express";
import {Service} from "../../@types/Service";
import AuthenticationResultParser from "../lib/authentication-result-parser";
import {convertToCountryPrefixFormat} from "../lib/mobile-number";
import {domainUserToDynamoUser} from "../lib/models/user-utils";
import SelfServiceServicesService from "../services/self-service-services-service";

export const showGetEmailForm = function (req: Request, res: Response) {
    res.render("register/enter-email-address.njk");
};

export const processGetEmailForm = async function (req: Request, res: Response, next: NextFunction) {
    const emailAddress: string = req.body.emailAddress;
    const s4: SelfServiceServicesService = await req.app.get("backing-service");
    try {
        await s4.createUser(emailAddress);
    } catch (error) {
        if (error instanceof UsernameExistsException) {
            res.redirect("/register/account-exists");
            return;
        }

        next(error);
    }

    req.session.emailAddress = emailAddress;
    res.redirect("/register/enter-email-code");
};

export const showCheckEmailForm = function (req: Request, res: Response) {
    if (!req.session.emailAddress) {
        res.redirect("/register");
        return;
    }

    res.render("register/enter-email-code.njk", {values: {emailAddress: req.session.emailAddress}});
};

export const submitEmailSecurityCode = async function (req: Request, res: Response, next: NextFunction) {
    if (!req.session.emailAddress) {
        console.error("submitEmailOtp::EmailAddress is not in the session, redirecting to submitEmailOtp");
        res.redirect("/register");
        return;
    }

    const s4: SelfServiceServicesService = await req.app.get("backing-service");

    try {
        const response = await s4.submitUsernamePassword(req.session.emailAddress as string, req.body.securityCode);
        req.session.cognitoSession = response.Session;
        res.redirect("/register/create-password");
        return;
    } catch (error) {
        if (error instanceof NotAuthorizedException) {
            res.render("register/enter-email-code.njk", {
                values: {emailAddress: req.session.emailAddress as string},
                errorMessages: {
                    securityCode: "The code you entered is not correct or has expired - enter it again or request a new code"
                }
            });

            return;
        } else {
            next(error);
        }
    }
};

export const showNewPasswordForm = async function (req: Request, res: Response) {
    // TODO we should probably throw here and in similar cases?
    if (req.session.cognitoSession !== undefined) {
        res.render("register/create-password.njk");
        return;
    } else {
        res.redirect("/sign-in");
    }
};

export const updatePassword = async function (req: Request, res: Response) {
    const s4: SelfServiceServicesService = req.app.get("backing-service");

    req.session.authenticationResult = await s4.setNewPassword(
        req.session.emailAddress as string,
        req.body["password"],
        req.session.cognitoSession as string
    );

    await s4.setEmailAsVerified(req.session.emailAddress as string);
    res.redirect("/register/enter-phone-number");
};

export const showEnterMobileForm = async function (req: Request, res: Response) {
    res.render("register/enter-phone-number.njk", {
        value: {mobileNumber: req.session.mobileNumber}
    });
};

export const processEnterMobileForm = async function (req: Request, res: Response) {
    // The user needs to be logged in for this
    const accessToken: string | undefined = req.session.authenticationResult?.AccessToken;

    if (accessToken === undefined) {
        console.error("processEnterMobileForm::user must log in before we can process their mobile number redirecting to /sign-in");
        // user must log in before we can process their mobile number
        res.redirect("/sign-in");
        return;
    }

    const mobileNumber = convertToCountryPrefixFormat(req.body.mobileNumber);
    const s4: SelfServiceServicesService = await req.app.get("backing-service");

    await s4.setPhoneNumber(req.session.emailAddress as string, mobileNumber);
    await s4.sendMobileNumberVerificationCode(accessToken);

    req.session.mobileNumber = mobileNumber;
    req.session.enteredMobileNumber = req.body.mobileNumber;
    res.redirect("/register/enter-text-code");
};

export const resendMobileVerificationCode = async function (req: Request, res: Response) {
    req.body.mobileNumber = req.session.enteredMobileNumber;
    await processEnterMobileForm(req, res);
};

export const showSubmitMobileVerificationCode = async function (req: Request, res: Response) {
    res.render("common/enter-text-code.njk", {
        values: {
            mobileNumber: req.session.enteredMobileNumber,
            textMessageNotReceivedUrl: "/register/resend-text-code"
        }
    });
};

export const submitMobileVerificationCode = async function (req: Request, res: Response) {
    const securityCode = req.body.securityCode;

    if (securityCode === undefined) {
        res.render("common/enter-text-code.njk", {
            values: {
                mobileNumber: req.session.mobileNumber,
                textMessageNotReceivedUrl: "/register/resend-text-code"
            }
        });

        return;
    }

    const s4: SelfServiceServicesService = req.app.get("backing-service");

    try {
        await s4.verifyMobileUsingSmsCode(req.session.authenticationResult?.AccessToken as string, securityCode);
    } catch (error) {
        if (error instanceof CodeMismatchException) {
            res.render("common/enter-text-code.njk", {
                values: {
                    securityCode: req.body.securityCode,
                    mobileNumber: req.session.enteredMobileNumber,
                    textMessageNotReceivedUrl: "/register/resend-text-code"
                },
                errorMessages: {
                    securityCode: "The code you entered is not correct or has expired - enter it again or request a new code"
                }
            });

            return;
        }

        throw error;
    }

    const cognitoId = AuthenticationResultParser.getCognitoId(req.session.authenticationResult as AuthenticationResultType);
    await s4.setMfaPreference(cognitoId);

    const email = AuthenticationResultParser.getEmail(req.session.authenticationResult as AuthenticationResultType);
    const phone = req.session.enteredMobileNumber as string;

    const user = domainUserToDynamoUser({
        id: cognitoId,
        fullName: "we haven't collected this full name",
        firstName: "we haven't collected this first name",
        lastName: "we haven't collected this last name",
        email: email,
        mobileNumber: phone,
        passwordLastUpdated: new Date().toLocaleDateString()
    });

    await s4.putUser(user, req.session.authenticationResult?.AccessToken as string);

    req.session.isSignedIn = true;
    res.redirect("/register/create-service");
};

export const showResendPhoneCodeForm = async function (req: Request, res: Response) {
    res.render("register/resend-text-code.njk");
};

export const showResendEmailCodeForm = async function (req: Request, res: Response) {
    res.render("register/resend-email-code.njk");
};

export const resendEmailVerificationCode = async function (req: Request, res: Response) {
    const s4: SelfServiceServicesService = await req.app.get("backing-service");
    await s4.resendEmailAuthCode(req.session.emailAddress as string);
    res.redirect("/register/enter-email-code");
};

export const showAddServiceForm = async function (req: Request, res: Response) {
    res.render("register/add-service-name.njk");
};

export const processAddServiceForm = async function (req: Request, res: Response) {
    const uuid = randomUUID();
    const service: Service = {
        id: `service#${uuid}`,
        serviceName: req.body.serviceName
    };

    const userId = AuthenticationResultParser.getCognitoId(req.session.authenticationResult as AuthenticationResultType);
    if (userId === undefined) {
        console.log("Can't get CognitoId from authenticationResult in session");
        res.render("there-is-a-problem.njk");
        return;
    }

    const s4: SelfServiceServicesService = req.app.get("backing-service");
    try {
        await s4.newService(service, userId, req.session.authenticationResult as AuthenticationResultType);
    } catch (error) {
        console.error(error);
        res.render("there-is-a-problem.njk");
        return;
    }

    const generatedClient = await s4.generateClient(service, req.session.authenticationResult as AuthenticationResultType);
    console.log(generatedClient.data);
    const body = JSON.parse(generatedClient.data.output).body;
    const serviceId = JSON.parse(body).pk;
    req.session.serviceName = req.body.serviceName;
    res.redirect(`/services/${serviceId.substring(8)}/clients`);
};

export const accountExists = async function (req: Request, res: Response) {
    res.render("register/account-exists.njk", {
        values: {
            emailAddress: req.session.emailAddress
        }
    });
};
