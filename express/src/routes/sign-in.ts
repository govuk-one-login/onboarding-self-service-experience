import express, {Request, Response} from "express";
import {processSignInForm, showSignInForm} from "../controllers/sign-in";

const router = express.Router();

router.get('/sign-in', showSignInForm);
router.post('/sign-in', processSignInForm);

export default router;