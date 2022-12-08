import {
    AuthenticationResultType,
    CodeMismatchException,
    LimitExceededException,
    NotAuthorizedException
} from "@aws-sdk/client-cognito-identity-provider";
import {randomUUID} from "crypto";
import {Request, Response} from "express";
import {Service} from "../../@types/Service";
import {User} from "../../@types/user";
import AuthenticationResultParser from "../lib/AuthenticationResultParser";
import {convertToCountryPrefixFormat} from "../lib/mobileNumberUtils";
import SelfServiceServicesService from "../services/self-service-services-service";

export const listServices = async function (req: Request, res: Response) {
    const s4: SelfServiceServicesService = req.app.get("backing-service");
    const userId = AuthenticationResultParser.getCognitoId(req.session.authenticationResult as AuthenticationResultType);
    if (userId == undefined) {
        console.log(req.query);
        console.error("Could not get CognitoId from AuthenticationResult in session. contollers/manage-account/listServices(req, res)");
        res.render("there-is-a-problem.njk");
        return;
    }

    const services = await s4.listServices(userId as string, req.session.authenticationResult?.AccessToken as string);
    if (services.length === 0) {
        res.redirect(`/add-service-name`);
        return;
    }
    if (services.length === 1) {
        res.redirect(`/client-details/${services[0].id}`);
        return;
    }

    res.render("manage-account/list-services.njk", {services: services});
};

export const showAddServiceForm = async function (req: Request, res: Response) {
    res.render("add-service-name.njk");
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
    res.redirect(`/client-details/${serviceId.substring(8)}`);
};

export const processUpdateServiceForm = async function (req: Request, res: Response) {
    const serviceName = req.body.serviceName;
    const selfServiceClientId = req.body.selfServiceClientId;
    const clientId = req.body.clientId;
    const clientServiceId = req.body.clientServiceId;

    if (serviceName === "") {
        res.render("account/change-service-name.njk", {
            errorMessages: {
                serviceName: "Enter your service name"
            }
        });

        return;
    }

    const userId = AuthenticationResultParser.getCognitoId(req.session.authenticationResult as AuthenticationResultType);
    if (userId === undefined) {
        console.log("Can't get CognitoId from authenticationResult in session");
        res.render("there-is-a-problem.njk");
        return;
    }

    const s4: SelfServiceServicesService = req.app.get("backing-service");
    await s4.updateClient(
        selfServiceClientId,
        clientServiceId,
        clientId,
        {client_name: serviceName},
        req.session.authenticationResult?.AccessToken as string
    );

    req.session.updatedField = "service name";
    res.redirect(`/client-details/${selfServiceClientId}`);
};

export const showChangePasswordForm = async function (req: Request, res: Response) {
    res.render("account/change-password.njk");
};

export const showAccount = async function (req: Request, res: Response) {
    if (!req.session.authenticationResult) {
        console.error("showAccount::authenticationResult not in session, redirecting to sign-in");
        res.redirect("sign-in.njk");
        return;
    }

    req.session.mobileNumber = AuthenticationResultParser.getPhoneNumber(req.session.authenticationResult as AuthenticationResultType);

    const s4: SelfServiceServicesService = req.app.get("backing-service");
    const user: User = await s4.getSelfServiceUser(req.session.authenticationResult as AuthenticationResultType);

    res.render("account/account.njk", {
        emailAddress: user.email,
        mobilePhoneNumber: user.mobileNumber,
        passwordLastChanged: lastUpdated(user.passwordLastUpdated),
        serviceName: "My juggling service",
        updatedField: req.session.updatedField
    });
    req.session.updatedField = undefined;
};

function lastUpdated(lastUpdated: string): string {
    const lastUpdateMillis: number = +new Date(lastUpdated);
    const now = +new Date();

    if (lastUpdateMillis > fiveMinutesBefore(now)) {
        return "Last updated just now";
    } else if (wasToday(lastUpdateMillis)) {
        return "Last updated today";
    } else {
        return `Last updated ${new Date(lastUpdateMillis).toLocaleDateString("en-gb", {
            weekday: "long",
            day: "numeric",
            year: "numeric",
            month: "long"
        })}`;
    }
}

function fiveMinutesBefore(someTime: number): number {
    return someTime - 5 * 60 * 1_000;
}

function wasToday(someTime: number): boolean {
    const today = new Date(new Date().toLocaleDateString());
    return someTime > today.getTime();
}

export const changePassword = async function (req: Request, res: Response) {
    const newPassword = req.body.password;
    const currentPassword = req.body.currentPassword;

    if (currentPassword === "") {
        res.render("account/change-password.njk", {
            errorMessages: {
                currentPassword: "Enter your current password"
            }
        });

        return;
    }

    if (newPassword === "") {
        res.render("account/change-password.njk", {
            values: {
                currentPassword: currentPassword
            },
            errorMessages: {
                password: "Enter your new password"
            }
        });

        return;
    }

    if (newPassword.length < 8) {
        res.render("account/change-password.njk", {
            values: {
                currentPassword: currentPassword,
                password: newPassword
            },
            errorMessages: {
                password: "Your password must be 8 characters or more"
            }
        });

        return;
    }

    try {
        const s4: SelfServiceServicesService = await req.app.get("backing-service");
        await s4.changePassword(req.session?.authenticationResult?.AccessToken as string, currentPassword, newPassword);
    } catch (error) {
        if (error instanceof LimitExceededException) {
            res.render("account/change-password.njk", {
                errorMessages: {
                    password: "You have tried to change your password too many times. Try again in 15 minutes."
                },
                values: {
                    currentPassword: currentPassword,
                    password: newPassword
                }
            });

            return;
        }

        if (error instanceof NotAuthorizedException) {
            res.render("account/change-password.njk", {
                errorMessages: {
                    password: "Your current password is incorrect"
                },
                values: {
                    currentPassword: "",
                    password: newPassword
                }
            });

            return;
        }

        throw error;
    }

    const s4: SelfServiceServicesService = await req.app.get("backing-service");
    await s4.updateUser(
        AuthenticationResultParser.getCognitoId(req.session.authenticationResult as AuthenticationResultType),
        {password_last_updated: new Date()},
        req.session?.authenticationResult?.AccessToken as string
    );

    req.session.updatedField = "password";
    res.redirect("/account");
};

export const showChangePhoneNumberForm = async function (req: Request, res: Response) {
    res.render("account/change-phone-number.njk");
};

export const processChangePhoneNumberForm = async function (req: Request, res: Response) {
    const s4: SelfServiceServicesService = await req.app.get("backing-service");
    await s4.setPhoneNumber(
        AuthenticationResultParser.getEmail(req.session.authenticationResult as AuthenticationResultType),
        convertToCountryPrefixFormat(req.body.mobileNumber)
    );
    req.session.mobileNumber = req.body.mobileNumber;
    const accessToken: string | undefined = req.session.authenticationResult?.AccessToken;
    if (accessToken === undefined) {
        console.error("processChangePhoneNumberForm::accessToken not present in session, redirecting to /sign-in");
        // user must log in before we can process their mobile number
        res.redirect("/sign-in");
        return;
    }
    await s4.sendMobileNumberVerificationCode(accessToken);

    res.render("check-mobile.njk", {
        values: {
            mobileNumber: req.body.mobileNumber,
            formActionUrl: "/verify-phone-code",
            textMessageNotReceivedUrl: "/create/resend-phone-code"
        }
    });
};

export const verifyMobileWithSmsCode = async function (req: Request, res: Response) {
    const s4: SelfServiceServicesService = await req.app.get("backing-service");
    const accessToken = req.session.authenticationResult?.AccessToken as string;
    try {
        await s4.verifyMobileUsingSmsCode(accessToken, req.body["sms-otp"]);
        await s4.setMobilePhoneAsVerified(
            AuthenticationResultParser.getEmail(req.session.authenticationResult as AuthenticationResultType) as string
        );
        await s4.updateUser(
            AuthenticationResultParser.getCognitoId(req.session.authenticationResult as AuthenticationResultType),
            {phone: req.session.mobileNumber},
            accessToken as string
        );
    } catch (error) {
        if (error instanceof CodeMismatchException) {
            const message = "The code you entered is not correct or has expired - enter it again or request a new code";
            const value = req.body["sms-otp"];
            res.render("check-mobile.njk", {
                values: {
                    "sms-otp": value,
                    mobileNumber: req.session.mobileNumber,
                    formActionUrl: "/verify-phone-code",
                    textMessageNotReceivedUrl: "/create/resend-phone-code"
                },
                errorMessages: {
                    "sms-otp": message
                }
            });

            return;
        }

        throw error;
    }

    req.session.updatedField = "mobile phone number";
    res.redirect("/account");
};
