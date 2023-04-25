import {RequestHandler} from "express";
import AuthenticationResultParser from "../lib/authentication-result-parser";
import SelfServiceServicesService from "../services/self-service-services-service";

export const listServices: RequestHandler = async (req, res) => {
    const s4: SelfServiceServicesService = req.app.get("backing-service");
    const userId = AuthenticationResultParser.getCognitoId(nonNull(req.session.authenticationResult));

    if (userId == undefined) {
        console.log(req.query);
        console.error("Could not get CognitoId from AuthenticationResult in session");
        res.render("there-is-a-problem.njk");
        return;
    }

    const services = await s4.listServices(userId);

    if (services.length === 0) {
        res.redirect(`/register/create-service`);
        return;
    }

    req.session.serviceName = undefined;
    res.render("services/services.njk", {services: services});
};
