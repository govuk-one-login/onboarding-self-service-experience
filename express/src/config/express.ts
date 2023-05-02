import express, {Express} from "express";
import "express-async-errors";
import "../lib/utils/optional";
import RequestContext from "../types/request-context";
import "./session-data";
import configureViews from "./views";

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

    configureViews(app);
    return app;
}
