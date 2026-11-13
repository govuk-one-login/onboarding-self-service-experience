import {Router} from "express";
import checkAuthorisation from "../middleware/authoriser.js";
import {showPrototypePage} from "../controllers/prototype.js";

const router = Router();
export default router;

router.use(checkAuthorisation);
router.get("/prototype", showPrototypePage);
