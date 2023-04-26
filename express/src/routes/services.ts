import {Router} from "express";
import {listServices} from "../controllers/services";
import checkAuthorisation from "../middleware/authoriser";
import setRequestContext from "../middleware/request-context";
import clients from "./clients";

const router = Router();
export default router;

router.use(checkAuthorisation);

router.get("/", listServices);

router.param("serviceId", setRequestContext);

router.use("/:serviceId/clients", clients);
