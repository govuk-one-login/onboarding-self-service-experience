import {RequestHandler} from "express";

export const signOut: RequestHandler = (req, res) => {
    req.session.destroy(() => res.redirect("/"));
};

export const sessionTimeout: RequestHandler = (req, res) => {
    res.render("session-timeout.njk");
};
