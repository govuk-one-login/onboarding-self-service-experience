import express, {Request, Response} from "express";
import {sessionTimeout, signOut} from "../controllers/session";

export const router = express.Router();
export default router;

router.get("/sign-out", signOut);

router.get("/session-timeout", sessionTimeout);

router.get("/there-is-a-problem", (req: Request, res: Response) => {
    res.render("there-is-a-problem.njk");
});
