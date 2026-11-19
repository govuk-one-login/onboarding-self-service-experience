import {static as serveStatic, urlencoded} from "express";
import {
    googleTagId,
    port,
    serviceUnavailableBannerStartDate,
    showServiceUnavailableBanner,
    showTestBanner,
    showServiceUnavailablePage
} from "./config/environment.js";
import Express from "./config/express.js";
import Helmet from "./config/helmet.js";
import {distribution} from "./config/resources.js";
import sessionStorage from "./config/session-storage.js";
import {errorHandler, notFoundHandler} from "./middleware/errors.js";
import signInStatus from "./middleware/sign-in-status.js";
import account from "./routes/account.js";
import baseRoutes from "./routes/base.js";
import register from "./routes/register.js";
import services from "./routes/services.js";
import signIn from "./routes/sign-in.js";
import serviceUnavailable from "./routes/service-unavailable.js";
import {requestLoggingMiddleware} from "./lib/requestLogging.js";
import logger from "./lib/logger.js";
import prototypeRouter from "./routes/prototype.js";

const app = Express();

app.use((req, res, next) => {
    res.append("Access-Control-Allow-Origin", ["*"]);
    res.append("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    res.append("Access-Control-Allow-Headers", "Content-Type");
    next();
});

app.use(Helmet());
app.get("/healthcheck", (req, res) => {
    return res.status(200).send("OK");
});

app.use("/assets", serveStatic(distribution.assets));
app.use("/assets/images", serveStatic(distribution.images));
app.use(urlencoded({extended: true}));
app.use(sessionStorage);
app.use(signInStatus);
app.use(requestLoggingMiddleware);

if (!showServiceUnavailablePage) {
    app.use(baseRoutes);
    app.use("/register", register);
    app.use("/sign-in", signIn);
    app.use("/account", account);
    app.use("/services", services);
    app.use(prototypeRouter);
} else {
    app.use(serviceUnavailable);
    app.all("*", function (req, res) {
        if (req.path !== "/service-unavailable") {
            res.redirect("/service-unavailable");
        }
    });
}

app.use(notFoundHandler);
app.use(errorHandler);

app.locals.googleTagId = googleTagId;
app.locals.showTestBanner = showTestBanner;
app.locals.showServiceUnavailableBanner = showServiceUnavailableBanner;
app.locals.serviceUnavailableBannerStartDate = serviceUnavailableBannerStartDate;

app.set("trust proxy", true);

const server = app.listen(port, () =>
    logger.debug(`Server running; listening on port ${port}, current time: ${new Date().toLocaleTimeString()}`)
);

process.on("SIGTERM", () => {
    logger.debug("Server shutdown signal received");
    server.close(() => {
        logger.debug("Closed server");
    });
});
