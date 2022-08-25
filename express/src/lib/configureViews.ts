import {Express} from "express-serve-static-core";
import {configure, render} from "nunjucks";
import path from "path";

export default function (app: Express, viewPath = "../../src/views") {
    configure([viewPath, path.dirname(require.resolve("govuk-frontend/package.json"))], {
        autoescape: true,
        noCache: true,
        express: app
    });

    app.engine("njk", render);
}
