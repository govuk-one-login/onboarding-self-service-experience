import {Router} from "express";
import {sessionTimeout, signOut} from "../controllers/session";
import {render} from "../middleware/request-handler";

const router = Router();
export default router;

router.get("/", (req, res) => {
    res.render("index.njk", {headerActiveItem: "get-started"});
});

router.get("/sign-out", signOut);

router.get("/session-timeout", sessionTimeout);

router.get("/there-is-a-problem", render("there-is-a-problem.njk"));
