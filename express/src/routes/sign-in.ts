import express, {Request, Response} from "express";
import {processSignInForm, showSignInForm, showLoginOtpMobile, processLoginOtpMobile} from "../controllers/sign-in";
import {mobileOtpValidator} from "../middleware/mobileOtpValidator";

const router = express.Router();

router.get('/sign-in', showSignInForm);
router.post('/sign-in', processSignInForm);
router.get('/sign-in-otp-mobile', showLoginOtpMobile);
router.post('/sign-in-otp-mobile', mobileOtpValidator('sign-in-otp-mobile.njk'), processLoginOtpMobile);

export default router;
