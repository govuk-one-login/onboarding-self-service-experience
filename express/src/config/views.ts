import {Express} from "express";
import {configure, render} from "nunjucks";
import {views} from "./resources";

export default function configureViews(app: Express) {
    const govukViews = require.resolve("govuk-frontend").match(/.*govuk-frontend\//)?.[0];

    if (!govukViews) {
        throw new Error("Couldn't load govuk-frontend module");
    }

    const env = configure([views, govukViews], {
        autoescape: true,
        noCache: true,
        express: app
    });

    // Add a custom filter named "log"
    env.addFilter("log", function (value) {
        console.log(value);
        return value; // It's important to return the value so it can be used by other filters or rendered
    });

    app.engine("njk", render);
}
