import {Router} from "express";
import {listServices, showAddNewServiceForm} from "../controllers/services";
import checkAuthorisation from "../middleware/authoriser";
import setRequestContext from "../middleware/request-context";
import clients from "./clients";
import {processAddServiceForm, redirectToServicesList} from "../controllers/register";
import validateServiceName from "../middleware/validators/service-name-validator";

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
