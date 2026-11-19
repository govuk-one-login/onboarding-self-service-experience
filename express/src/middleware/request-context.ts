import {RequestParamHandler} from "express";
import {ContextProperty} from "../types/request-context.js";
import logger from "../lib/logger.js";

export default setRequestContext();

export function setRequestContext(property?: ContextProperty): RequestParamHandler {
    logger.debug("In setRequestContext()");

    return (req, res, next, value, name) => {
        req.context[property ?? (name as ContextProperty)] = value;
        next();
    };
}
