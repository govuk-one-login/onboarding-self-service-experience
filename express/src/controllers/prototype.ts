import { RequestHandler } from "express";

export const showPrototypePage: RequestHandler = (_, res) => {
    res.render("clients/prototype.njk", {
       password: "TODO: Fix this"
    });
};
