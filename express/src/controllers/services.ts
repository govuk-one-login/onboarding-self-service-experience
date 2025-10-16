import {RequestHandler} from "express";
import AuthenticationResultParser from "../lib/authentication-result-parser";
import SelfServiceServicesService from "../services/self-service-services-service";
import {render} from "../middleware/request-handler";
import {getNextPathsAndRedirect, RegisterRoutes} from "../middleware/state-machine";

export const listServices: RequestHandler = async (req, res) => {
    const s4: SelfServiceServicesService = req.app.get("backing-service");
    const userId = AuthenticationResultParser.getCognitoId(nonNull(req.session.authenticationResult));

    if (!userId) {
        return res.render("there-is-a-problem.njk");
    }

    const services = await s4.listServices(userId, nonNull(req.session.authenticationResult?.AccessToken));

    if (services.length === 0) {
        return getNextPathsAndRedirect(req, res, RegisterRoutes.createService);
    }

    req.session.serviceName = undefined;
    res.render("services/services.njk", {services: services});
};

export const showAddNewServiceForm = render("services/add-new-service.njk");
