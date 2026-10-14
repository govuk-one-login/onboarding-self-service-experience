import { Router } from "express";
import checkAuthorisation from "../middleware/authoriser";
import { showPrototypePage } from "../controllers/prototype";

const router = Router();
export default router;

router.use(checkAuthorisation);
router.get("/prototype", showPrototypePage);