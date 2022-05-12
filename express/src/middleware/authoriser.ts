import express, {Request, Response, NextFunction} from "express";


export function checkAuthorisation(req: Request, res: Response, next: NextFunction) {
    if(!req.session.authenticationResult?.AccessToken) {
        res.render('sign-in.njk', {values: new Map<string, string>(), errorMessages: new Map<string, string>()});
    } else {
        next();
    }
}