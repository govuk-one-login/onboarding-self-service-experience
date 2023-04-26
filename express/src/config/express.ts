import express, {Express} from "express";
import RequestContext from "../types/request-context";

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

    return app;
}
