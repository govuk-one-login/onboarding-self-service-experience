import {Router} from "express";
import {listServices} from "../controllers/services";
import checkAuthorisation from "../middleware/authoriser";
import headerActiveItem, {HeaderItem} from "../middleware/navigation";
import setRequestContext from "../middleware/request-context";
import clients from "./clients";

const router = Router();
export default router;

router.use(checkAuthorisation);
router.use(headerActiveItem(HeaderItem.YourAccount));

router.get("/", listServices);

router.param("serviceId", setRequestContext);

router.use("/:serviceId/clients", clients);
