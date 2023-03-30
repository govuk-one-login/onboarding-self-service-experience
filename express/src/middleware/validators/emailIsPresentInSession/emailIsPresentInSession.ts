import {RequestHandler} from "express";

export default function emailIsPresentInSession(
    template: string,
    renderOptions: {
        values?: {[name: string]: string};
        errorMessages?: {[name: string]: string};
    }
): RequestHandler {
    return async (req, res, next) => {
        if (req.session.emailAddress) {
            next();
        } else {
            res.render(template, renderOptions);
            return;
        }
    };
}
