import {Router} from "express";
import {sessionTimeout, signOut} from "../controllers/session";
import {render} from "../middleware/request-handler";

const router = Router();
export default router;

router.get("/", (req, res) => {
    res.redirect(303, "/sign-in/enter-email-address");
});

router.get("/sign-out", signOut);

router.get("/session-timeout", sessionTimeout);

router.get("/there-is-a-problem", render("there-is-a-problem.njk"));
