import {RequestHandler} from "express";

export enum HeaderItem {
    SignIn = "sign-in",
    GetStarted = "get-started",
    YourAccount = "your-account"
}

export default function setHeaderActiveItem(item: HeaderItem): RequestHandler {
    return (req, res, next) => {
        res.locals.headerActiveItem = item;
        next();
    };
}
