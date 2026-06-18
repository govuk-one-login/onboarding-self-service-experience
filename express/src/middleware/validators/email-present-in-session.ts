import {RequestHandler} from "express";
import logger from "express/src/lib/logger";

export default function checkEmailIsPresentInSession(template: string, renderOptions?: object): RequestHandler {
    logger.debug("In checkEmailIsPresentInSession()");

    return (req, res, next) => {
        if (!req.session.emailAddress) {
            return res.render(template, renderOptions);
        }

        next();
    };
}
