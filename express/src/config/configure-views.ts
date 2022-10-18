import {Express} from "express-serve-static-core";
import * as nunjucks from "nunjucks";
import {render} from "nunjucks";

export default function (app: Express, viewPath = "../../src/views") {
    const govukViews = require.resolve("govuk-frontend").match(/.*govuk-frontend\//)?.[0];

    if (!govukViews) {
        throw "Couldn't load govuk-frontend module";
    }

    const nunjucksEnv: nunjucks.Environment = nunjucks.configure([viewPath, govukViews], {
        autoescape: true,
        express: app,
        noCache: true
    });

    nunjucksEnv.addFilter("shortenKey", function (str) {
        return str.slice(0, 24);
    });

    app.engine("njk", render);
}
