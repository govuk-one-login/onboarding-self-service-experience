import {ErrorRequestHandler, RequestHandler} from "express";
import requestHandler, {errorHandler as errorRequestHandler} from "./request-handler";
import SelfServiceServicesService from "../services/self-service-services-service";
import AuthenticationResultParser from "../lib/authentication-result-parser";

export const notFoundHandler: RequestHandler = requestHandler((req, res) => {
    const s4: SelfServiceServicesService = req.app.get("backing-service");

    let userId = "unknown"; // Some errors may occur before a user or session is established
    let sessionId = "unknown";

    try {
        sessionId = req.session.id;
        userId = AuthenticationResultParser.getCognitoId(nonNull(req.session.authenticationResult));
    } catch {
        console.debug("RequestHandler: unable to establish identifiers from session.");
    }

    s4.sendTxMALog("ERROR_UNAVAILABLE", sessionId, {
        user_id: userId,
        ip_address: req.ip
    });

    res.status(404).render("404.njk");
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Error handling middleware must take 4 arguments
export const errorHandler: ErrorRequestHandler = errorRequestHandler((err, req, res, next) => {
    console.error("ErrorRequestHandler: error info: " + err);

    const s4: SelfServiceServicesService = req.app.get("backing-service");

    let userId = "unknown"; // Some errors may occur before a user or session is established
    let sessionId = "unknown";

    try {
        sessionId = req.session.id;
        userId = AuthenticationResultParser.getCognitoId(nonNull(req.session.authenticationResult));
    } catch {
        console.debug("ErrorRequestHandler: unable to establish identifiers from session.");
    }

    s4.sendTxMALog("ERROR_PROBLEM", sessionId, {
        ip_address: req.ip,
        user_id: userId
    });

    res.render("there-is-a-problem.njk");
});
