import {Request, Response} from "express";
import LambdaFacadeInterface from "../lib/lambda-facade/LambdaFacadeInterface";
import {randomUUID} from "crypto";
import {User} from "../../@types/user";
import {Service} from "../../@types/Service";
import CognitoInterface from "../lib/cognito/CognitoInterface";
import {CodeMismatchException, LimitExceededException, NotAuthorizedException} from "@aws-sdk/client-cognito-identity-provider";

export const listServices = async function (req: Request, res: Response) {
    const lambdaFacade: LambdaFacadeInterface = req.app.get("lambdaFacade");
    if (req.session.selfServiceUser == undefined) {
        console.error("No user in session. contollers/manage-account/listServices(req, res)");
        res.render("there-is-a-problem.njk");
        return;
    }
    const user: User = req.session.selfServiceUser;
    const services = await lambdaFacade.listServices(user.pk.S as string, req.session.authenticationResult?.AccessToken as string);
    if (services.data.Items.length === 0) {
        res.redirect("/add-service-name");
        return;
    }
    if (services.data.Items.length === 1) {
        res.redirect(`/client-details/${services.data.Items[0].pk.S.substring("service#".length)}`);
        return;
    }

    res.render("manage-account/list-services.njk", {services: services.data.Items});
};

export const showAddServiceForm = async function (req: Request, res: Response) {
    res.render("add-service-name.njk");
};

export const processAddServiceForm = async function (req: Request, res: Response) {
    const uuid = randomUUID();
    const service: Service = {
        pk: `service#${uuid}`,
        sk: `service#${uuid}`,
        data: req.body.serviceName,
        service_name: req.body.serviceName
    };
    const user = req.session.selfServiceUser as User;
    let newServiceOutput;
    const lambdaFacade: LambdaFacadeInterface = req.app.get("lambdaFacade");
    const newUser: any = {};
    try {
        // @ts-ignore
        Object.keys(user).forEach(key => (newUser[key] = user[key]["S"]));
        newServiceOutput = await lambdaFacade.newService(service, newUser, req.session.authenticationResult?.AccessToken as string);
    } catch (error) {
        console.error(error);
        res.render("there-is-a-problem.njk");
        return;
    }

    const newServiceData = JSON.parse(newServiceOutput?.data.output);
    const generatedClient = await lambdaFacade.generateClient(
        newServiceData.serviceId,
        service,
        newUser.email as string,
        req.session.authenticationResult?.AccessToken as string
    );
    const body = JSON.parse(generatedClient.data.output).body;
    const serviceId = JSON.parse(body).pk;
    res.redirect(`/client-details/${serviceId.substring(8)}`);
};

export const showChangePasswordForm = async function (req: Request, res: Response) {
    res.render("account/change-password.njk");
};

export const showAccount = async function (req: Request, res: Response) {
    const payload = (req.session.authenticationResult?.IdToken as string).split("."); //duplcated code
    const claims = Buffer.from(payload[1], "base64").toString("utf-8");
    const cognitoId = JSON.parse(claims)["cognito:username"];
    req.session.mobileNumber = JSON.parse(claims)["phone_number"];

    const lambdaFacade: LambdaFacadeInterface = req.app.get("lambdaFacade");
    req.session.selfServiceUser = (
        await lambdaFacade.getUserByCognitoId(`cognito_username#${cognitoId}`, req.session?.authenticationResult?.AccessToken as string)
    ).data.Items[0];

    const user: User = req.session?.selfServiceUser as User;
    res.render("account/account.njk", {
        emailAddress: user.email?.S,
        mobilePhoneNumber: user.phone?.S,
        passwordLastChanged: lastUpdated(user.password_last_updated?.S),
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
    return lastUpdated ? lastUpdated : "Never changed";
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
        const errorMessages = new Map<string, string>();
        errorMessages.set("currentPassword", "Enter your current password");
        res.render("account/change-password.njk", {
            errorMessages: errorMessages
        });
        return;
    }

    if (newPassword === "") {
        const errorMessages = new Map<string, string>();
        errorMessages.set("password", "Enter your new password");
        const value: object = {currentPassword: currentPassword};
        res.render("account/change-password.njk", {
            errorMessages: errorMessages,
            value: value
        });
        return;
    }

    if (newPassword.length < 8) {
        const errorMessages = new Map<string, string>();
        errorMessages.set("password", "Your password must be 8 characters or more");
        const value: object = {
            currentPassword: currentPassword,
            password: newPassword
        };
        res.render("account/change-password.njk", {
            errorMessages: errorMessages,
            value: value
        });
        return;
    }

    try {
        const cognitoClient: CognitoInterface = await req.app.get("cognitoClient");
        await cognitoClient.changePassword(req.session?.authenticationResult?.AccessToken as string, currentPassword, newPassword);
    } catch (error) {
        console.error("ERROR CALLING COGNITO WITH NEW PASSWORD");
        console.error(error);

        if (error instanceof LimitExceededException) {
            const value: object = {
                currentPassword: currentPassword,
                password: newPassword
            };
            const errorMessages = new Map<string, string>();
            errorMessages.set("no-control", "You have tried to change your password too many times.  Try again in 15 minutes.");
            res.render("account/change-password.njk", {
                errorMessages: errorMessages,
                value: value
            });
            return;
        }

        if (error instanceof NotAuthorizedException) {
            const value: object = {
                currentPassword: "",
                password: newPassword
            };
            const errorMessages = new Map<string, string>();
            errorMessages.set("password", "Your current password is wrong");
            res.render("account/change-password.njk", {
                errorMessages: errorMessages,
                value: value
            });
            return;
        }

        res.render("there-is-a-problem.njk");
        return;
    }

    try {
        const lambdaFacade: LambdaFacadeInterface = await req.app.get("lambdaFacade");
        await lambdaFacade.updateUser(
            req.session?.selfServiceUser?.pk.S.substring("user#".length) as string,
            req.session?.selfServiceUser?.sk.S.substring("cognito_username#".length) as string,
            {password_last_updated: new Date()},
            req.session?.authenticationResult?.AccessToken as string
        );
    } catch (error) {
        console.error("ERROR CALLING LAMBDA WITH USER TO UDPDATE");
        console.error(error);
        res.render("there-is-a-problem.njk");
        return;
    }
    req.session.updatedField = "password";
    res.redirect("/account");
};

export const showChangePhoneNumberForm = async function (req: Request, res: Response) {
    res.render("account/change-phone-number.njk");
};

export const processChangePhoneNumberForm = async function (req: Request, res: Response) {
    const mobileNumber = req.body.mobileNumber;
    const cognitoClient: CognitoInterface = await req.app.get("cognitoClient");

    await cognitoClient.setPhoneNumber(req.session.emailAddress as string, mobileNumber);
    req.session.mobileNumber = mobileNumber;

    const accessToken: string | undefined = req.session.authenticationResult?.AccessToken;
    if (accessToken === undefined) {
        // user must log in before we can process their mobile number
        res.redirect("/sign-in");
        return;
    }
    await cognitoClient.sendMobileNumberVerificationCode(accessToken);

    res.render("check-mobile.njk", {
        values: {
            mobileNumber: req.body.mobileNumber,
            formActionUrl: "/verify-phone-code",
            textMessageNotReceivedUrl: "/create/resend-phone-code"
        }
    });
};

export const verifySmsCode = async function (req: Request, res: Response) {
    if (!req.session.mobileNumber) {
        throw "Mobile number not found in session";
    }

    const cognitoClient: CognitoInterface = await req.app.get("cognitoClient");
    const lambdaFacade: LambdaFacadeInterface = await req.app.get("lambdaFacade");
    const accessToken = req.session.authenticationResult?.AccessToken as string;

    try {
        await cognitoClient.verifySmsCode(accessToken, req.body["sms-otp"]);
        await cognitoClient.setMobilePhoneAsVerified(req.session.emailAddress as string);
        await lambdaFacade.updateUser(
            req.session?.selfServiceUser?.pk.S.substring("user#".length) as string,
            req.session?.selfServiceUser?.sk.S.substring("cognito_username#".length) as string,
            {phone: req.session.mobileNumber},
            accessToken as string
        );
    } catch (error) {
        if (error instanceof CodeMismatchException) {
            const errorMessages = new Map<string, string>();
            errorMessages.set("smsOtp", "The code you entered is not correct or has expired - enter it again or request a new code");
            res.render("check-mobile.njk", {
                mobileNumber: req.session.mobileNumber,
                errorMessages: errorMessages,
                formActionUrl: "/verify-phone-code",
                textMessageNotReceivedUrl: "/resend-phone-code"
            });
            return;
        }

        console.error(error);
        res.redirect("/there-is-a-problem");
        return;
    }

    req.session.updatedField = "mobile phone number";
    res.redirect("/account");
};
