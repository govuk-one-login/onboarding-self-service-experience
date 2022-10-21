import {Express} from "express-serve-static-core";
import {configure, render} from "nunjucks";
import {views} from "./resources";

export default function (app: Express) {
    const govukViews = require.resolve("govuk-frontend").match(/.*govuk-frontend\//)?.[0];

    if (!govukViews) {
        throw "Couldn't load govuk-frontend module";
    }

    configure([views, govukViews], {
        autoescape: true,
        noCache: true,
        express: app
    });

    app.engine("njk", render);
}
