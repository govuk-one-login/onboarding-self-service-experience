import {Router} from "express";
import {listServices, showAddNewServiceForm} from "../controllers/services.js";
import checkAuthorisation from "../middleware/authoriser.js";
import setRequestContext from "../middleware/request-context.js";
import clients from "./clients.js";
import {processAddServiceForm, redirectToServicesList} from "../controllers/register.js";
import validateServiceName from "../middleware/validators/service-name-validator.js";

const router = Router();
export default router;

router.use(checkAuthorisation);

router.get("/", listServices);

router.param("serviceId", setRequestContext);

router.use("/:serviceId/clients", clients);

router
    .route("/add-new-service")
    .get(showAddNewServiceForm)
    .post(validateServiceName("services/add-new-service.njk"), processAddServiceForm, redirectToServicesList);
