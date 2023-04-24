import {Router} from "express";
import {sessionTimeout, signOut} from "../controllers/session";
import setHeaderActiveItem, {HeaderItem} from "../middleware/navigation";
import {render} from "../middleware/request-handler";

const router = Router();
export default router;

router.get("/", setHeaderActiveItem(HeaderItem.GetStarted), render("index.njk"));

router.get("/sign-out", signOut);

router.get("/session-timeout", sessionTimeout);

router.get("/there-is-a-problem", render("there-is-a-problem.njk"));
