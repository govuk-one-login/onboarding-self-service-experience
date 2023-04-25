import {RequestHandler} from "express";

export default function checkEmailIsPresentInSession(template: string, renderOptions?: object): RequestHandler {
    return (req, res, next) => {
        if (!req.session.emailAddress) {
            return res.render(template, renderOptions);
        }

        next();
    };
}
