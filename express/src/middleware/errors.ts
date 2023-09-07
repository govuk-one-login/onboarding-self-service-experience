import {ErrorRequestHandler, RequestHandler} from "express";
import requestHandler, {errorHandler as errorRequestHandler} from "./request-handler";
import SelfServiceServicesService from "../services/self-service-services-service";
import AuthenticationResultParser from "../lib/authentication-result-parser";

export const notFoundHandler: RequestHandler = requestHandler((req, res) => {
    const s4: SelfServiceServicesService = req.app.get("backing-service");
    const userId = AuthenticationResultParser.getCognitoId(nonNull(req.session.authenticationResult));

    s4.sendTxMALog({
        userIp: req.ip,
        event: "ERROR_UNAVAILABLE",
        journeyId: req.session.id,
        userId: userId
    });

    res.status(404).render("404.njk");
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Error handling middleware must take 4 arguments
export const errorHandler: ErrorRequestHandler = errorRequestHandler((err, req, res, next) => {
    const s4: SelfServiceServicesService = req.app.get("backing-service");
    const userId = AuthenticationResultParser.getCognitoId(nonNull(req.session.authenticationResult));

    s4.sendTxMALog({
        userIp: req.ip,
        event: "ERROR_PROBLEM",
        journeyId: req.session.id,
        userId: userId
    });

    console.error(err);
    res.render("there-is-a-problem.njk");
});
