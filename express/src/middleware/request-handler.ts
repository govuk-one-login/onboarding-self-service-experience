import {ErrorRequestHandler, RequestHandler} from "express";

export default function requestHandler(handler: RequestHandler): RequestHandler {
    return handler;
}

export function errorHandler(handler: ErrorRequestHandler): ErrorRequestHandler {
    return handler;
}

export function render(view: string): RequestHandler {
    return (req, res) => {
        res.render(view);
    };
}
