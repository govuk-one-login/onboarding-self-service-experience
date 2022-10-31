import express from "express";
import {
    processEmailAddress,
    finishSignIn,
    processSignInForm,
    resendMobileVerificationCode,
    showLoginOtpMobile,
    showResendPhoneCodeForm,
    showSignInFormEmail,
    showSignInFormPassword,
    signOut,
    sessionTimeout,
    accountExists
} from "../controllers/sign-in";
import emailIsPresentInSession from "../middleware/emailIsPresentInSession/emailIsPresentInSession";
import {emailValidator} from "../middleware/emailValidator";
import {mobileOtpValidator} from "../middleware/mobileOtpValidator";
import {passwordValidator} from "../middleware/passwordValidator";
import {processLoginOtpMobile} from "../middleware/sign-in-middleware";

const router = express.Router();

router.get("/sign-in", showSignInFormEmail);
router.get("/session-timeout", sessionTimeout);
router.post("/sign-in", emailValidator("sign-in.njk"), processEmailAddress);
router.get(
    "/sign-in-password",
    emailIsPresentInSession("sign-in.njk", {errorMessages: {emailAddress: "Enter your email address"}}),
    showSignInFormPassword
);

router.post(
    "/sign-in-password",
    emailIsPresentInSession("sign-in.njk", {errorMessages: {emailAddress: "Enter your email address"}}),
    passwordValidator("sign-in-enter-password.njk"),
    processSignInForm
);

router.get("/sign-in-otp-mobile", showLoginOtpMobile);

router.post(
    "/sign-in-otp-mobile",
    mobileOtpValidator(true, "/sign-in-otp-mobile", "/resend-text-code"),
    processLoginOtpMobile,
    finishSignIn
);

router.get("/resend-text-code", showResendPhoneCodeForm);
router.post("/resend-text-code", resendMobileVerificationCode);
router.get("/account/sign-out", signOut);
router.get("/existing-account", accountExists);
router.post("/existing-account", passwordValidator("create-account/existing-account.njk"), async (req, res) => {
    res.render("check-mobile.njk");
});

router.get("/no-account", (req, res) => {
    res.render("no-account-found.njk");
});

export default router;
