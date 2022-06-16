import express, {Request, Response} from "express";
import {processEmailAddress, processSignInForm, showSignInFormEmail, showSignInFormPassword} from "../controllers/sign-in";
import {emailValidator} from "../middleware/emailValidator";
import {passwordValidator} from "../middleware/passwordValidator";


const router = express.Router();

router.get('/sign-in', showSignInFormEmail);
router.post('/sign-in', emailValidator('sign-in.njk'), processEmailAddress);
router.get('/sign-in-password', showSignInFormPassword);
router.post('/sign-in-password', passwordValidator('sign-in-password.njk'), processSignInForm);

export default router;
