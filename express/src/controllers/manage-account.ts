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
import getAuthApiCompliantPublicKey from "../lib/publicKeyUtils";

const defaultPublicKey =
    "MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEAp2mLkQGo24Kz1rut0oZlviMkGomlQCH+iT1pFvegZFXq39NPjRWyatmXp/XIUPqCq9Kk8/+tq4Sgjw+EM5tATJ06j5r+35of58ATGVPniW//IhGizrv6/ebGcGEUJ0Y/ZmlCHYPV+lbewpttQ/IYKM1nr3k/Rl6qepbVYe+MpGubluQvdhgUYel9OzxiOvUk7XI0axPquiXzoEgmNNOai8+WhYTkBqE3/OucAv+XwXdnx4XHmKzMwTv93dYMpUmvTxWcSeEJ/4/SrbiK4PyHWVKU2BozfSUejVNhahAzZeyyDwhYJmhBaZi/3eOOlqGXj9UdkOXbl3vcwBH8wD30O9/4F5ERLKxzOaMnKZ+RpnygWF0qFhf+UeFMy+O06sdgiaFnXaSCsIy/SohspkKiLjNnhvrDNmPLMQbQKQlJdcp6zUzI7Gzys7luEmOxyMpA32lDBQcjL7KNwM15s4ytfrJ46XEPZUXESce2gj6NazcPPsrTa/Q2+oLS9GWupGh7AgMBAAE=";

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

    req.session.serviceName = undefined;
    res.render("manage-account/list-services.njk", {services: services});
};

export const showClient = async function (req: Request, res: Response) {
    // TODO make S4 instances static in all controllers
    const serviceId = req.params.serviceId;
    const s4: SelfServiceServicesService = req.app.get("backing-service");
    const client = (await s4.listClients(serviceId, req.session.authenticationResult?.AccessToken as string))[0];
    const selfServiceClientId = client.dynamoServiceId;
    const authClientId = client.authClientId;
    const serviceName = client.serviceName;
    const redirectUrls = String(client.redirectUris).split(",");
    const userPublicKey = client.publicKey == defaultPublicKey ? "" : getAuthApiCompliantPublicKey(client.publicKey);

    res.render("service-details/client-details.njk", {
        clientId: authClientId,
        selfServiceClientId: selfServiceClientId,
        serviceId: serviceId,
        serviceName: serviceName,
        updatedField: req.session.updatedField,
        redirectUrls: redirectUrls,
        userAttributesRequired: client.scopes.join(", "),
        userPublicKey: userPublicKey,
        postLogoutRedirectUrls: client.postLogoutUris.join(" "),
        urls: {
            // TODO changeClientName is currently not used
            changeClientName: `/change-client-name/${serviceId}/${selfServiceClientId}/${authClientId}?clientName=${encodeURIComponent(
                client.clientName
            )}`,
            changeRedirectUris: `/change-redirect-uris/${serviceId}/${selfServiceClientId}/${authClientId}?redirectUris=${encodeURIComponent(
                client.redirectUris.join(" ")
            )}`,
            changeUserAttributes: `/change-user-attributes/${serviceId}/${selfServiceClientId}/${authClientId}?userAttributes=${encodeURIComponent(
                client.scopes.join(" ")
            )}`,
            changePublicKey: `/change-public-key/${serviceId}/${selfServiceClientId}/${authClientId}?publicKey=${encodeURIComponent(
                userPublicKey
            )}`,
            changePostLogoutUris: `/change-post-logout-uris/${serviceId}/${selfServiceClientId}/${authClientId}?redirectUris=${encodeURIComponent(
                client.postLogoutUris.join(" ")
            )}`
        }
    });

    // TODO we need to use a flash message package for Express
    req.session.serviceName = client.serviceName ? client.serviceName : client.clientName;
    req.session.updatedField = undefined;
};

export const showPrivateBetaForm = async function (req: Request, res: Response) {
    res.render("service-details/private-beta.njk", {
        serviceId: req.params.serviceId,
        selfServiceClientId: req.params.selfServiceClientId,
        clientId: req.params.clientId,
        serviceName: req.session.serviceName,
        emailAddress: req.session.emailAddress
    });
};

export const processPrivateBetaForm = async function (req: Request, res: Response) {
    const yourName = req.body.yourName;
    const department = req.body.department;
    const serviceName = req.body.serviceName;
    const emailAddress = req.session.emailAddress;
    const serviceId = req.params.serviceId;
    const selfServiceClientId = req.params.selfServiceClientId;
    const clientId = req.params.clientId;
    const errorMessages = new Map<string, string>();

    if (yourName === "") {
        errorMessages.set("yourName", "Enter your name");
    }

    if (department === "") {
        errorMessages.set("department", "Enter your department");
    }

    if (errorMessages.size > 0) {
        res.render("service-details/private-beta.njk", {
            serviceId: serviceId,
            selfServiceClientId: selfServiceClientId,
            clientId: clientId,
            serviceName: serviceName,
            emailAddress: emailAddress,
            errorMessages: Object.fromEntries(errorMessages),
            values: {
                yourName: yourName,
                department: department
            }
        });

        return;
    }

    const s4: SelfServiceServicesService = req.app.get("backing-service");
    await s4.privateBetaRequest(
        yourName,
        department,
        serviceName,
        emailAddress as string,
        req.session.authenticationResult?.AccessToken as string
    );

    res.redirect(`/private-beta-form-submitted/${serviceId}/${selfServiceClientId}/${clientId}`);
};

export const showPrivateBetaFormSubmitted = async function (req: Request, res: Response) {
    res.render("service-details/private-beta-form-submitted.njk", {
        serviceId: req.params.serviceId,
        selfServiceClientId: req.params.selfServiceClientId,
        clientId: req.params.clientId
    });
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
    req.session.serviceName = req.body.serviceName;
    res.redirect(`/client-details/${serviceId.substring(8)}`);
};

export const processChangeServiceNameForm = async function (req: Request, res: Response) {
    const newServiceName = req.body.serviceName;
    const serviceId = req.params.serviceId;

    if (newServiceName === "") {
        res.render("account/change-service-name.njk", {
            serviceId: serviceId,
            errorMessages: {
                serviceName: "Enter your service name"
            }
        });

        return;
    }

    const selfServiceClientId = req.params.selfServiceClientId;
    const clientId = req.params.clientId;
    const s4: SelfServiceServicesService = req.app.get("backing-service");

    // TODO service_name is the db layer leaking into the domain
    // TODO is this correct? Don't we also need to update the pk:service sk:service entry? We need an updateService call
    await s4.updateClient(
        serviceId,
        selfServiceClientId,
        clientId,
        {service_name: newServiceName},
        req.session.authenticationResult?.AccessToken as string
    );
    req.session.updatedField = "service name";
    req.session.serviceName = newServiceName;
    res.redirect(`/client-details/${serviceId}`);
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

    // TODO Use a password validator
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

    req.session.enteredMobileNumber = req.body.mobileNumber;
    await s4.sendMobileNumberVerificationCode(req.session.authenticationResult?.AccessToken as string);

    res.redirect("/account/verify-phone-code");
};

export const showVerifyMobileWithSmsCode = async function (req: Request, res: Response) {
    res.render("common/check-mobile.njk", {
        headerActiveItem: "your-account",
        values: {
            mobileNumber: req.session.enteredMobileNumber,
            textMessageNotReceivedUrl: "/account/resend-phone-code"
        }
    });
};

export const verifyMobileWithSmsCode = async function (req: Request, res: Response) {
    const s4: SelfServiceServicesService = await req.app.get("backing-service");
    const accessToken = req.session.authenticationResult?.AccessToken as string;

    try {
        await s4.verifyMobileUsingSmsCode(accessToken, req.body.securityCode);
        await s4.setMobilePhoneAsVerified(
            AuthenticationResultParser.getEmail(req.session.authenticationResult as AuthenticationResultType) as string
        );

        await s4.updateUser(
            AuthenticationResultParser.getCognitoId(req.session.authenticationResult as AuthenticationResultType),
            {phone: req.session.enteredMobileNumber as string},
            accessToken as string
        );

        req.session.mobileNumber = req.session.enteredMobileNumber;
        req.session.enteredMobileNumber = undefined;
    } catch (error) {
        if (error instanceof CodeMismatchException) {
            res.render("common/check-mobile.njk", {
                headerActiveItem: "your-account",
                values: {
                    securityCode: req.body.securityCode,
                    mobileNumber: req.session.enteredMobileNumber,
                    textMessageNotReceivedUrl: "/account/resend-phone-code"
                },
                errorMessages: {
                    securityCode: "The code you entered is not correct or has expired - enter it again or request a new code"
                }
            });

            return;
        }

        throw error;
    }

    req.session.updatedField = "mobile phone number";
    res.redirect("/account");
};
