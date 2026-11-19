import express, {Express} from "express";
import "express-async-errors";
import "../lib/utils/optional.js";
import RequestContext from "../types/request-context.js";
import "./session-data.js";
import configureViews from "./views.js";
import configureServices from "./services.js";

export default function Express(): Express {
    const app = express();

    Object.defineProperties(app.request, {
        context: {
            configurable: true,
            enumerable: true,

            get(): Partial<RequestContext> {
                return (this.contextProperties ??= {});
            }
        }
    });

    configureServices(app);
    app.set("nunjucksEngine", configureViews(app));
    return app;
}
