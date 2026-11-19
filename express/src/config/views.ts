import type express from "express";
import nunjucks from "nunjucks";
import {views} from "./resources.js";

export default function configureViews(app: express.Application): nunjucks.Environment {
    const nunjucksEnv: nunjucks.Environment = nunjucks.configure(views, {
        autoescape: true,
        express: app,
        noCache: true
    });

    return nunjucksEnv;
}
