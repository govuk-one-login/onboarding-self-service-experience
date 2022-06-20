import express, {Request, Response} from "express";
import {
    processEmailAddress,
    processSignInForm,
    showSignInFormEmail,
    showSignInFormPassword,
    showLoginOtpMobile,
    processLoginOtpMobile
} from "../controllers/sign-in";
import {emailValidator} from "../middleware/emailValidator";
import {passwordValidator} from "../middleware/passwordValidator";
import {mobileOtpValidator} from "../middleware/mobileOtpValidator";

const router = express.Router();

router.get('/sign-in', showSignInFormEmail);
router.post('/sign-in', emailValidator('sign-in.njk'), processEmailAddress);
router.get('/sign-in-password', showSignInFormPassword);
router.post('/sign-in-password', passwordValidator('sign-in-password.njk'), processSignInForm);
router.get('/sign-in-otp-mobile', showLoginOtpMobile);
router.post('/sign-in-otp-mobile', mobileOtpValidator('sign-in-otp-mobile.njk', true), processLoginOtpMobile);

export default router;
