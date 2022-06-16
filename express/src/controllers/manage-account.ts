import express, {Request, Response} from "express";
import router from "../routes/testing-routes";
import LambdaFacadeInterface from "../lib/lambda-facade/LambdaFacadeInterface";
import {randomUUID} from "crypto";
import {User} from "../../@types/User";

export const listServices = async function(req: Request, res: Response) {
    res.render('manage-account/list-services.njk');
}

export const showAddServiceForm = async function (req: Request, res: Response) {
    res.render("add-service-name.njk");
}
export const processAddServiceForm = async function (req: Request, res: Response) {
    console.log(req.body)
    const uuid = randomUUID();
    const service = {
        "pk": `service#${uuid}`,
        "sk": `service#${uuid}`,
        "data": req.body.serviceName,
        "service_name": req.body.serviceName
    }
    let user = req.session.selfServiceUser as User;
    try {
        let newUser: any = {};
        const lambdaFacade: LambdaFacadeInterface = req.app.get("lambdaFacade");
        // @ts-ignore
        Object.keys(user).forEach(key => newUser[key] = user[key]["S"])
        console.log(newUser)
        await lambdaFacade.newService(service, newUser, req.session.authenticationResult?.AccessToken as string);
    } catch (error) {
        console.error(error);
    }
    //This will need to update, when functionality for creating service is implemented
    res.redirect("/service-dashboard-client-details");
}

