import {Router} from "express";
import {sessionTimeout, signOut} from "../controllers/session";

const router = Router();
export default router;

router.get("/", (req, res) => {
    res.render("index.njk", {headerActiveItem: "get-started"});
});

router.get("/sign-out", signOut);

router.get("/session-timeout", sessionTimeout);

router.get("/there-is-a-problem", (req, res) => {
    res.render("there-is-a-problem.njk");
});
