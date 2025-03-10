import {CodeMismatchException, NotAuthorizedException, UsernameExistsException} from "@aws-sdk/client-cognito-identity-provider";
import {randomUUID} from "crypto";
import {RequestHandler} from "express";
import {Service} from "../../@types/Service";
import AuthenticationResultParser from "../lib/authentication-result-parser";
import {domainUserToDynamoUser} from "../lib/models/user-utils";
import {convertToCountryPrefixFormat} from "../lib/mobile-number";
import {render} from "../middleware/request-handler";
import SelfServiceServicesService from "../services/self-service-services-service";
import * as console from "console";
import {SignupStatus, SignupStatusStage} from "../lib/utils/signup-status";
import {getFixedOTPCredentialMobileNumber, isPseudonymisedFixedOTPCredential} from "../lib/fixedOTP";

export const showGetEmailForm = render("register/enter-email-address.njk");

export const processGetEmailForm: RequestHandler = async (req, res) => {
    const emailAddress: string = req.body.emailAddress;
    const s4: SelfServiceServicesService = req.app.get("backing-service");
    console.info("In ProcessGetEmailForm");

    req.session.emailAddress = emailAddress;
    req.session.save();

    try {
        await s4.createUser(emailAddress);
    } catch (error) {
        if (error instanceof UsernameExistsException) {
            const signUpStatus: SignupStatus = await s4.getSignUpStatus(emailAddress);

            console.info("In UserNameExistException");

            if (!signUpStatus.hasStage(SignupStatusStage.HasEmail)) {
                console.info("Processing No HasEMail");
                return res.redirect("resume-before-password");
            }

            if (!signUpStatus.hasStage(SignupStatusStage.HasPassword)) {
                console.info("Processing No HasPassword");
                return res.redirect("resume-before-password");
            }

            if (!signUpStatus.hasStage(SignupStatusStage.HasPhoneNumber)) {
                console.info("Processing No HasPhoneNumber");
                return res.redirect("resume-after-password");
            }

            if (!signUpStatus.hasStage(SignupStatusStage.HasTextCode)) {
                console.info("Processing No HasTextCode");
                return res.redirect("resume-after-password");
            }

            console.info("Redirecting to Default");
            return res.redirect("/register/account-exists");
        }

        throw error;
    }

    res.redirect("/register/enter-email-code");
};

export const showCheckEmailForm: RequestHandler = async (req, res) => {
    console.log("In register-showCheckEmailForm");

    const s4: SelfServiceServicesService = req.app.get("backing-service");

    if (!req.session.emailAddress) {
        return res.redirect("/register");
    }

    if (
        (req.session.emailCodeSubmitCount && req.session.emailCodeSubmitCount >= 6) ||
        (await s4.getEmailCodeBlock(req.session.emailAddress.toLowerCase().trim()))
    ) {
        console.log("Email is code blocked");
        return res.render("register/too-many-codes.njk");
    }

    s4.sendTxMALog("SSE_EMAIL_VERIFICATION_REQUEST", {
        session_id: req.session.id,
        ip_address: req.ip,
        email: req.session.emailAddress
    });

    res.render("register/enter-email-code.njk", {values: {emailAddress: req.session.emailAddress}});
};

export const submitEmailSecurityCode: RequestHandler = async (req, res) => {
    console.log("In register-submitEmailSecurityCode");

    const s4: SelfServiceServicesService = req.app.get("backing-service");

    if (!req.session.emailAddress) {
        return res.redirect("/register");
    }

    if (
        (req.session.emailCodeSubmitCount && req.session.emailCodeSubmitCount >= 6) ||
        (await s4.getEmailCodeBlock(req.session.emailAddress.toLowerCase().trim()))
    ) {
        console.warn("Email blocked for OTP code");
        return res.render("register/too-many-codes.njk");
    }

    try {
        const response = await s4.submitUsernamePassword(req.session.emailAddress, req.body.securityCode);
        req.session.cognitoSession = response.Session;
        await s4.removeEmailCodeBlock(req.session.emailAddress.toLowerCase().trim());
    } catch (error) {
        if (error instanceof NotAuthorizedException) {
            if (!req.session.emailCodeSubmitCount) {
                req.session.emailCodeSubmitCount = 1;
            } else {
                req.session.emailCodeSubmitCount += 1;
            }
            req.session.save();

            if (req.session.emailCodeSubmitCount >= 6) {
                console.warn("Email code block added");
                await s4.putEmailCodeBlock(req.session.emailAddress.toLowerCase().trim());
                return res.render("register/too-many-codes.njk");
            }

            s4.sendTxMALog(
                "SSE_EMAIL_VERIFICATION_COMPLETE",
                {
                    session_id: req.session.id,
                    ip_address: req.ip,
                    email: req.session.emailAddress
                },
                {
                    outcome: "failed"
                }
            );

            return res.render("register/enter-email-code.njk", {
                values: {emailAddress: req.session.emailAddress},
                errorMessages: {
                    securityCode: "The code you entered is not correct or has expired - enter it again or request a new code"
                }
            });
        }

        throw error;
    }

    await s4.setSignUpStatus(req.session.emailAddress, SignupStatusStage.HasEmail);

    s4.sendTxMALog(
        "SSE_EMAIL_VERIFICATION_COMPLETE",
        {
            session_id: req.session.id,
            ip_address: req.ip,
            email: req.session.emailAddress
        },
        {
            outcome: "success"
        }
    );

    res.redirect("/register/create-password");
};

export const showNewPasswordForm: RequestHandler = (req, res) => {
    console.log("In register:showNewPasswordForm");

    // TODO we should probably throw here and in similar cases?
    if (req.session.cognitoSession !== undefined) {
        return res.render("register/create-password.njk");
    }

    res.redirect("/sign-in");
};

export const updatePassword: RequestHandler = async (req, res) => {
    const s4: SelfServiceServicesService = req.app.get("backing-service");
    const emailAddress = nonNull(req.session.emailAddress);

    req.session.authenticationResult = await s4.setNewPassword(emailAddress, req.body["password"], nonNull(req.session.cognitoSession));

    await s4.setEmailAsVerified(emailAddress);
    await s4.setSignUpStatus(emailAddress, SignupStatusStage.HasPassword);

    res.redirect("/register/enter-phone-number");
};

export const showEnterMobileForm: RequestHandler = (req, res) => {
    res.render("register/enter-phone-number.njk", {
        value: {mobileNumber: req.session.mobileNumber}
    });
};

export const processEnterMobileForm: RequestHandler = async (req, res) => {
    console.info("In Controller:Register - processEnterMobileForm()");

    const accessToken = req.session.authenticationResult?.AccessToken;

    if (!accessToken) {
        return res.redirect("/sign-in");
    }

    let mobileNumber = req.body.mobileNumber;

    if (isPseudonymisedFixedOTPCredential(req.body.mobileNumber)) {
        mobileNumber = getFixedOTPCredentialMobileNumber(req.body.mobileNumber);
    }

    mobileNumber = convertToCountryPrefixFormat(mobileNumber);
    const s4: SelfServiceServicesService = req.app.get("backing-service");

    await s4.setPhoneNumber(nonNull(req.session.emailAddress), mobileNumber);
    await s4.sendMobileNumberVerificationCode(accessToken);

    req.session.mobileNumber = mobileNumber;
    req.session.enteredMobileNumber = req.body.mobileNumber;

    const emailAddress = nonNull(req.session.emailAddress);
    await s4.setSignUpStatus(emailAddress, SignupStatusStage.HasPhoneNumber);

    s4.sendTxMALog("SSE_PHONE_VERIFICATION_REQUEST", {
        email: req.session.emailAddress,
        session_id: req.session.id,
        ip_address: req.ip,
        phone: req.session.enteredMobileNumber
    });

    res.redirect("/register/enter-text-code");
};

export const resendMobileVerificationCode: RequestHandler = (req, res, next) => {
    req.body.mobileNumber = req.session.enteredMobileNumber;
    return processEnterMobileForm(req, res, next);
};

export const showSubmitMobileVerificationCode: RequestHandler = (req, res) => {
    res.render("common/enter-text-code.njk", {
        values: {
            mobileNumber: req.session.enteredMobileNumber,
            textMessageNotReceivedUrl: "/register/resend-text-code"
        }
    });
};

export const submitMobileVerificationCode: RequestHandler = async (req, res) => {
    const securityCode = req.body.securityCode;

    if (!securityCode) {
        return res.render("common/enter-text-code.njk", {
            values: {
                mobileNumber: req.session.mobileNumber,
                textMessageNotReceivedUrl: "/register/resend-text-code"
            }
        });
    }

    const s4: SelfServiceServicesService = req.app.get("backing-service");
    const authenticationResult = nonNull(req.session.authenticationResult);
    const accessToken = nonNull(authenticationResult.AccessToken);

    try {
        const emailAddress: string = AuthenticationResultParser.getEmail(nonNull(authenticationResult));
        await s4.verifyMobileUsingSmsCode(accessToken, securityCode, emailAddress);
    } catch (error) {
        if (error instanceof CodeMismatchException) {
            s4.sendTxMALog(
                "SSE_PHONE_VERIFICATION_COMPLETE",
                {
                    session_id: req.session.id,
                    ip_address: req.ip,
                    phone: req.session.enteredMobileNumber
                },
                {
                    outcome: "failed"
                }
            );

            return res.render("common/enter-text-code.njk", {
                values: {
                    securityCode: req.body.securityCode,
                    mobileNumber: req.session.enteredMobileNumber,
                    textMessageNotReceivedUrl: "/register/resend-text-code"
                },
                errorMessages: {
                    securityCode: "The code you entered is not correct or has expired - enter it again or request a new code"
                }
            });
        }

        throw error;
    }

    const cognitoId = AuthenticationResultParser.getCognitoId(authenticationResult);
    const emailAddress = AuthenticationResultParser.getEmail(authenticationResult);

    await s4.setMfaPreference(cognitoId);

    const user = domainUserToDynamoUser({
        id: cognitoId,
        fullName: "we haven't collected this full name",
        firstName: "we haven't collected this first name",
        lastName: "we haven't collected this last name",
        email: emailAddress,
        mobileNumber: nonNull(req.session.enteredMobileNumber),
        passwordLastUpdated: new Date().toLocaleDateString()
    });

    await s4.putUser(user, accessToken);
    req.session.isSignedIn = true;

    await s4.setSignUpStatus(emailAddress, SignupStatusStage.HasTextCode);

    s4.sendTxMALog(
        "SSE_PHONE_VERIFICATION_COMPLETE",
        {
            session_id: req.session.id,
            ip_address: req.ip,
            user_id: cognitoId,
            phone: req.session.enteredMobileNumber
        },
        {
            outcome: "success"
        }
    );

    s4.sendTxMALog("SSE_CREATE_ACCOUNT", {
        session_id: req.session.id,
        ip_address: req.ip,
        user_id: cognitoId,
        email: AuthenticationResultParser.getEmail(authenticationResult)
    });

    res.redirect("/register/create-service");
};

export const showResendPhoneCodeForm = render("register/resend-text-code.njk");
export const showResendEmailCodeForm: RequestHandler = async (req, res) => {
    const s4: SelfServiceServicesService = await req.app.get("backing-service");

    if (
        (req.session.emailCodeSubmitCount && req.session.emailCodeSubmitCount >= 6) ||
        (await s4.getEmailCodeBlock((req.session.emailAddress as string).toLowerCase().trim()))
    ) {
        res.render("/register/too-many-codes.njk");
        return;
    }

    res.render("register/resend-email-code.njk");
};
export const resumeAfterPassword = render("register/resume-after-password.njk");

export const resendEmailVerificationCode: RequestHandler = async (req, res) => {
    const s4: SelfServiceServicesService = await req.app.get("backing-service");

    console.info("Resending E-Mail Verification Code");
    if (
        (req.session.emailCodeSubmitCount && req.session.emailCodeSubmitCount >= 6) ||
        (await s4.getEmailCodeBlock((req.session.emailAddress as string).toLowerCase().trim()))
    ) {
        res.render("/register/too-many-codes.njk");
        return;
    }

    await s4.resendEmailAuthCode(req.session.emailAddress as string);
    return res.redirect("/register/enter-email-code");
};

export const showAddServiceForm = render("register/add-service-name.njk");

export const processAddServiceForm: RequestHandler = async (req, res, next) => {
    const uuid = randomUUID();
    const service: Service = {
        id: `service#${uuid}`,
        serviceName: req.body.serviceName
    };

    const userId = AuthenticationResultParser.getCognitoId(nonNull(req.session.authenticationResult));

    if (!userId) {
        console.info("Can't get CognitoId from authenticationResult in session");
        return res.render("there-is-a-problem.njk");
    }

    const s4: SelfServiceServicesService = req.app.get("backing-service");

    try {
        console.info("Adding Service:" + service.serviceName);
        await s4.newService(service, userId, nonNull(req.session.authenticationResult));
    } catch (error) {
        console.error(error);
        return res.render("there-is-a-problem.njk");
    }

    req.session.serviceName = req.body.serviceName;

    let serviceId = "";
    let body;
    const accessToken = nonNull(req.session.authenticationResult?.AccessToken);
    try {
        console.info("Generating Client to Service:" + service.serviceName);
        const generatedClient = await s4.generateClient(service, nonNull(req.session.authenticationResult));
        body = JSON.parse(generatedClient.data.output).body;
        serviceId = JSON.parse(body).pk;
    } catch (error) {
        console.error("Unable to Register Client to Service - Service Items removed");
        console.error(error);
        await s4.deleteServiceEntries(uuid, accessToken);
        return res.render("there-is-a-problem.njk");
    }

    req.session.serviceId = serviceId;

    s4.sendTxMALog(
        "SSE_SERVICE_ADDED",
        {
            session_id: req.session.id,
            ip_address: req.ip,
            user_id: userId
        },
        {
            service_id: serviceId,
            service_name: req.session.serviceName
        }
    );

    next();
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const sendDataToUserSpreadsheet: RequestHandler = async (req, res, next) => {
    const s4: SelfServiceServicesService = req.app.get("backing-service");

    const {mobileNumber, emailAddress, serviceName} = req.session;
    const effectiveMobileNumber = mobileNumber || " ";

    await s4.updateUserSpreadsheet(nonNull(emailAddress), effectiveMobileNumber, nonNull(serviceName));
    next();
};

export const redirectToServicesList: RequestHandler = (req, res) => {
    const serviceId = String(req.session.serviceId);
    res.redirect(`/services/${serviceId.substring(8)}/clients`);
};

export const accountExists: RequestHandler = (req, res) => {
    res.render("register/account-exists.njk", {
        values: {
            emailAddress: req.session.emailAddress
        }
    });
};

export const resumeUserJourneyAfterPassword: RequestHandler = async (req, res) => {
    const s4: SelfServiceServicesService = req.app.get("backing-service");

    console.info("In resumeUserJourney");
    const userName = nonNull(req.session.emailAddress);
    const userPassword = nonNull(req.body["password"]);

    const response = await s4.submitUsernamePassword(userName, userPassword);
    req.session.cognitoSession = response.Session;
    req.session.authenticationResult = response.AuthenticationResult;

    // if User has already entered their phone number we 'resume' from re-entering their Phone number again.
    // This is to allow for the fact that they may have entered an incorrect number.
    return res.redirect("enter-phone-number");
};
