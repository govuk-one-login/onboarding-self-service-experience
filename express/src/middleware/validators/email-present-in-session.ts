import {RequestHandler} from "express";

export default function checkEmailIsPresentInSession(template: string, renderOptions?: object): RequestHandler {
    console.info("In checkEmailIsPresentInSession()");

    return (req, res, next) => {
        if (!req.session.emailAddress) {
            return res.render(template, renderOptions);
        }

        next();
    };
}
