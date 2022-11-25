import express from "express";
import {
    processEmailAddress,
    finishSignIn,
    resendMobileVerificationCode,
    showLoginOtpMobile,
    showResendPhoneCodeForm,
    showSignInFormEmail,
    showSignInFormPassword,
    signOut,
    sessionTimeout,
    accountExists,
    forgotPasswordForm,
    resendForgotPassword,
    checkEmailPasswordReset
} from "../controllers/sign-in";
import emailIsPresentInSession from "../middleware/validators/emailIsPresentInSession/emailIsPresentInSession";
import {emailValidator} from "../middleware/validators/emailValidator";
import {mobileOtpValidator} from "../middleware/validators/mobileOtpValidator";
import {processLoginOtpMobile} from "../middleware/sign-in-middleware";
import processSignInForm from "../middleware/processSignInForm";

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
    processSignInForm("sign-in-enter-password.njk")
);

router.get("/sign-in-otp-mobile", showLoginOtpMobile);

router.post("/sign-in-otp-mobile", mobileOtpValidator("/sign-in-otp-mobile", "/resend-text-code"), processLoginOtpMobile, finishSignIn);

router.get("/resend-text-code", showResendPhoneCodeForm);
router.post("/resend-text-code", resendMobileVerificationCode);
router.get("/account/sign-out", signOut);
router.get("/existing-account", accountExists);
router.post("/existing-account", processSignInForm("create-account/existing-account.njk"));

router.get("/no-account", (req, res) => {
    res.render("no-account-found.njk");
});

router.get(
    "/forgot-password",
    emailIsPresentInSession("sign-in.njk", {errorMessages: {emailAddress: "Enter your email address"}}),
    forgotPasswordForm
);
router.get(
    "/check-email-password-reset",
    emailIsPresentInSession("sign-in.njk", {errorMessages: {emailAddress: "Enter your email address"}}),
    checkEmailPasswordReset
);
router.post(
    "/check-email-password-reset",
    emailIsPresentInSession("sign-in.njk", {errorMessages: {emailAddress: "Enter your email address"}}),
    resendForgotPassword
);

export default router;
