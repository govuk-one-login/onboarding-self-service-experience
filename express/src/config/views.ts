import {Express} from "express";
import {configure, render} from "nunjucks";
import {views} from "./resources";

export default function configureViews(app: Express) {
    const govukViews = require.resolve("govuk-frontend").match(/.*govuk-frontend\//)?.[0];

    if (!govukViews) {
        throw new Error("Couldn't load govuk-frontend module");
    }

    configure([views, govukViews], {
        autoescape: true,
        noCache: true,
        express: app
    });

    app.engine("njk", render);
}
