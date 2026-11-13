import {Router} from "express";
import {render} from "../middleware/request-handler.js";
import {serviceUnavailablePageEndDate} from "../config/environment.js";

const router = Router();
export default router;

router.get("/service-unavailable", render("service-unavailable.njk", {date: serviceUnavailablePageEndDate}));
