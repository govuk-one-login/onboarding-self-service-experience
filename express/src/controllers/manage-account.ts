import express, {Request, Response} from "express";
import LambdaFacadeInterface from "../lib/lambda-facade/LambdaFacadeInterface";
import {randomUUID} from "crypto";
import {User} from "../../@types/User";
import {Service} from "../../@types/Service";

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
    console.log(services.data.Items);
    if(services.data.Items.length === 1) {
        res.redirect(`/client-details/${services.data.Items[0].pk.S.substring(8)}`);
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
        console.log(newUser)
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
