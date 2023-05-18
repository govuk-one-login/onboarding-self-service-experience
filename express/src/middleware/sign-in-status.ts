import {NextFunction, Request, RequestHandler, Response} from "express";

export default (function setSignInStatus(req: Request, res: Response, next: NextFunction) {
    // TODO this should be determined by the AuthToken possibly or some other authentication property rather than manually set value
    res.locals.isSignedIn = !!req.session.isSignedIn;
    next();
} satisfies RequestHandler);
