import {NextFunction, Request, Response} from "express";

export function setSignedInStatus(req: Request, res: Response, next: NextFunction) {
    res.locals.isSignedIn = req.session.isSignedIn !== undefined && req.session.isSignedIn;
    next();
}
