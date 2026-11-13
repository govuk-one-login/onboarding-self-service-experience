import {RequestHandler} from "express";
import {render} from "../middleware/request-handler.js";

export const signOut: RequestHandler = (req, res) => {
    req.session.destroy(() => res.redirect("/"));
};

export const sessionTimeout = render("session-timeout.njk");
