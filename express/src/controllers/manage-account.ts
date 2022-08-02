import express, {Request, Response} from "express";
import LambdaFacadeInterface from "../lib/lambda-facade/LambdaFacadeInterface";
import {randomUUID} from "crypto";
import {User} from "../../@types/User";
import {Service} from "../../@types/Service";
import {lambdaFacadeInstance} from "../lib/lambda-facade/LambdaFacade";
import CognitoInterface from "../lib/cognito/CognitoInterface";

export const listServices = async function(req: Request, res: Response) {
    const lambdaFacade: LambdaFacadeInterface = req.app.get("lambdaFacade");
    if(req.session.selfServiceUser == undefined) {
        res.render('there-is-a-problem.njk');
        return;
    }
    const user: User = req.session.selfServiceUser;
    const services = await lambdaFacade.listServices(user.pk.S as string, req.session.authenticationResult?.AccessToken as string);
    if(services.data.Items.length === 0) {
        res.redirect('/add-service-name');
        return;
    }
    if(services.data.Items.length === 1) {
        res.redirect(`/client-details/${services.data.Items[0].pk.S.substring("#services".length)}`);
        return;
    }

    res.render('manage-account/list-services.njk', {services: services.data.Items});
}

export const showAddServiceForm = async function (req: Request, res: Response) {
    res.render("add-service-name.njk");
}

export const processAddServiceForm = async function (req: Request, res: Response) {
    const uuid = randomUUID();
    const service: Service = {
        "pk": `service#${uuid}`,
        "sk": `service#${uuid}`,
        "data": req.body.serviceName,
        "service_name": req.body.serviceName
    }
    let user = req.session.selfServiceUser as User;
    let newServiceOutput;
    const lambdaFacade: LambdaFacadeInterface = req.app.get("lambdaFacade");
    let newUser: any = {};
    try {
        // @ts-ignore
        Object.keys(user).forEach(key => newUser[key] = user[key]["S"])
        newServiceOutput = await lambdaFacade.newService(service, newUser, req.session.authenticationResult?.AccessToken as string)

    } catch (error) {
        console.error(error);
        res.render('there-is-a-problem.njk');
        return;
    }

    let newServiceData = JSON.parse(newServiceOutput?.data.output);
    const generatedClient = await lambdaFacade.generateClient(newServiceData.serviceId, service, newUser.email as string, req.session.authenticationResult?.AccessToken as string)
    const body = JSON.parse(generatedClient.data.output).body;
    const serviceId = JSON.parse(body).pk;
    res.redirect(`/client-details/${serviceId.substring(8)}`);
}

export const showChangePasswordForm = async function (req: Request, res: Response) {
    res.render("account/change-password.njk");
}

export const changePassword = async function (req: Request, res: Response)  {
    let newPassword = req.body.password;
    let currentPassword = req.body.currentPassword;

    if (currentPassword ==="") {
        const errorMessages = new Map<string, string>();
        errorMessages.set('currentPassword', 'Enter your current password');
        res.render('account/change-password.njk', {
            errorMessages: errorMessages,
        });
        return;
    }

    if (newPassword ==="") {
        const errorMessages = new Map<string, string>();
        errorMessages.set('password', 'Enter your new password');
        const value : object = {currentPassword: currentPassword};
        res.render('account/change-password.njk', {
            errorMessages: errorMessages,
            value: value
        });
        return;
    }

    if (!/^.{8,}$/.test(newPassword)) {
        const errorMessages = new Map<string, string>();
        errorMessages.set('password', 'Your password must be 8 characters or more');
        const value : object = {
            currentPassword: currentPassword,
            password: newPassword
        };
        res.render('account/change-password.njk', {
            errorMessages: errorMessages,
            value: value
        });
        return;
    }

    try {
        const cognitoClient: CognitoInterface = await req.app.get('cognitoClient');
        await cognitoClient.changePassword(req.session?.authenticationResult?.AccessToken as string, currentPassword, newPassword);
    } catch (error) {
        console.log(error);
        res.render('there-is-a-problem.njk');
        return;
    }

    try {
        const lambdaFacade: LambdaFacadeInterface = await req.app.get("lambdaFacade");
        lambdaFacade.updateUser(req.session?.selfServiceUser?.pk.S as string, req.session?.cognitoUser?.Username as string, {password: newPassword})
    } catch (error) {
        console.log(error);
        res.render('there-is-a-problem.njk');
        return;
    }
    req.session.updatedField = "password";
    res.redirect('/account');
}