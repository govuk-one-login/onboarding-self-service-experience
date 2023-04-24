import {ErrorRequestHandler, RequestHandler} from "express";
import path from "path";

export default function requestHandler(handler: RequestHandler): RequestHandler {
    return handler;
}

export function errorHandler(handler: ErrorRequestHandler): ErrorRequestHandler {
    return handler;
}

export function redirect(url: string, fromAppRoot = false): RequestHandler {
    return (req, res) => {
        res.redirect(303, fromAppRoot ? path.join(req.baseUrl, url) : url);
    };
}

export function render(view: string, options?: object): RequestHandler {
    return (req, res) => {
        res.render(view, options);
    };
}
