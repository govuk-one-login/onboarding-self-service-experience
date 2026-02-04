import {static as serveStatic, urlencoded} from "express";
import {
    googleTagId,
    port,
    serviceUnavailableBannerStartDate,
    showServiceUnavailableBanner,
    showTestBanner,
    showServiceUnavailablePage
} from "./config/environment";
import Express from "./config/express";
import Helmet from "./config/helmet";
import {distribution} from "./config/resources";
import sessionStorage from "./config/session-storage";
import {errorHandler, notFoundHandler} from "./middleware/errors";
import signInStatus from "./middleware/sign-in-status";
import account from "./routes/account";
import baseRoutes from "./routes/base";
import register from "./routes/register";
import services from "./routes/services";
import signIn from "./routes/sign-in";
import serviceUnavailable from "./routes/service-unavailable";

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

if (!showServiceUnavailablePage) {
    app.use(baseRoutes);
    app.use("/register", register);
    app.use("/sign-in", signIn);
    app.use("/account", account);
    app.use("/services", services);
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
    console.log(`Server running; listening on port ${port}, current time: ${new Date().toLocaleTimeString()}`)
);

process.on("SIGTERM", () => {
    console.debug("Server shutdown signal received");
    server.close(() => {
        console.debug("Closed server");
    });
});
