import express from "express";
import {
    accountExists,
    checkEmailPasswordReset,
    finishSignIn,
    forgotPasswordForm,
    processEmailAddress,
    sessionTimeout,
    showLoginOtpMobile,
    showResendPhoneCodePage,
    showSignInFormEmail,
    showSignInFormPassword,
    signOut
} from "../controllers/sign-in";
import processSignInForm from "../middleware/processSignInForm";
import {processLoginOtpMobile} from "../middleware/sign-in-middleware";
import emailIsPresentInSession from "../middleware/validators/emailIsPresentInSession/emailIsPresentInSession";
import {emailValidator} from "../middleware/validators/emailValidator";
import {mobileOtpValidator} from "../middleware/validators/mobileOtpValidator";

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

router.get("/resend-text-code", showResendPhoneCodePage);

// TODO this only renders the page but it needs to resend the mobile OTP but we need the password to do this or find another way
router.post("/resend-text-code", showLoginOtpMobile);

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
    checkEmailPasswordReset
);

export default router;
