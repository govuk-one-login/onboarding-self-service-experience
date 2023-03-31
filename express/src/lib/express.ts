import express, {Express} from "express";

export default function Express(): Express {
    const app = express();

    Object.defineProperties(app.request, {
        context: {
            configurable: true,
            enumerable: true,

            get() {
                return (this.contextProperties ??= {});
            }
        }
    });

    return app;
}
