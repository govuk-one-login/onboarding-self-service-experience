import {Express} from "express";
import {configure, render} from "nunjucks";
import {views} from "./resources";

export default function configureViews(app: Express) {
    const govukViews = require.resolve("govuk-frontend").match(/.*govuk-frontend\//)?.[0];

    if (!govukViews) {
        throw new Error("Couldn't load govuk-frontend module");
    }

    const nunjucksEnv = configure([views, govukViews], {
        autoescape: true,
        noCache: true,
        express: app
    });

    nunjucksEnv.addGlobal("MAY_2025_REBRAND_ENABLED", process.env.MAY_2025_REBRAND_ENABLED == "true");
    app.engine("njk", render);
}
