import express, {Request, Response} from "express";
import LambdaFacadeInterface from "../lib/lambda-facade/LambdaFacadeInterface";
import {randomUUID} from "crypto";
import {User} from "../../@types/User";
import {Service} from "../../@types/Service";

export const listServices = async function(req: Request, res: Response) {
    res.render('manage-account/list-services.njk');
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
    res.redirect("/client-details");
}

export const generateClient = async function (req: Request, res: Response) {

}
