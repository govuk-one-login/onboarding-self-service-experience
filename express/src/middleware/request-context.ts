import {RequestParamHandler} from "express";
import {ContextProperty} from "../types/request";

export default setRequestContext();

export function setRequestContext(property?: ContextProperty): RequestParamHandler {
    return (req, res, next, value, name) => {
        req.context[property ?? (name as ContextProperty)] = value;
        next();
    };
}
