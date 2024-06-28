import {static as serveStatic, urlencoded} from "express";
import {port, showTestBanner} from "./config/environment";
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

const app = Express();

app.use((req, res, next) => {
    res.append("Access-Control-Allow-Origin", ["*"]);
    res.append("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    res.append("Access-Control-Allow-Headers", "Content-Type");
    next();
});

app.use(Helmet());

app.use("/assets", serveStatic(distribution.assets));
app.use("/assets/images", serveStatic(distribution.images));
app.use("/ga4-assets", serveStatic(distribution.ga4Assets));

app.use(urlencoded({extended: true}));
app.use(sessionStorage);
app.use(signInStatus);

app.use(baseRoutes);
app.use("/register", register);
app.use("/sign-in", signIn);
app.use("/account", account);
app.use("/services", services);

app.use(notFoundHandler);
app.use(errorHandler);

app.locals.showTestBanner = showTestBanner;
app.locals.ga4ContainerId = process.env.GOOGLE_ANALYTICS_4_GTM_CONTAINER_ID;
app.locals.uaContainerId = process.env.UNIVERSAL_ANALYTICS_GTM_CONTAINER_ID;
app.locals.ga4Disabled = process.env.GA4_DISABLED || true;
app.locals.uaDisabled = process.env.UA_DISABLED || true;
app.locals.cookieDomain = process.env.COOKIE_DOMAIN || "sign-in.service.gov.uk";

app.set("trust proxy", true);

app.listen(port, () => console.log(`Server running; listening on port ${port}, current time: ${new Date().toLocaleTimeString()}`));
