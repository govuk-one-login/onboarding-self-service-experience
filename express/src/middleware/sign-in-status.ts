import {RequestHandler} from "express";

export default setSignInStatus();

function setSignInStatus(): RequestHandler {
    return (req, res, next) => {
        res.locals.isSignedIn = !!req.session.isSignedIn;
        next();
    };
}
