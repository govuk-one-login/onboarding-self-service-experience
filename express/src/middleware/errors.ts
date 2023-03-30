import {ErrorRequestHandler, RequestHandler} from "express";

export const notFoundHandler: RequestHandler = (req, res) => {
    res.status(404).render("404.njk");
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Error handling middleware must take 4 arguments
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    console.error(err);
    res.render("there-is-a-problem.njk");
};
