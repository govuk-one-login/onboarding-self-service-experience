import express from "express";
import {
    checkEmailPasswordReset,
    confirmForgotPassword,
    confirmForgotPasswordForm,
    finishSignIn,
    forgotPasswordForm,
    processEmailAddress,
    showCheckPhonePage,
    showResendPhoneCodePage,
    showSignInFormEmail,
    showSignInFormPassword
} from "../controllers/sign-in";
import processSignInForm from "../middleware/processSignInForm";
import {processSecurityCode} from "../middleware/sign-in-middleware";
import emailIsPresentInSession from "../middleware/validators/emailIsPresentInSession/emailIsPresentInSession";
import {emailValidator} from "../middleware/validators/emailValidator";
import {mobileSecurityCodeValidator} from "../middleware/validators/mobileOtpValidator";
import notOnCommonPasswordListValidator from "../middleware/validators/notOnCommonPasswordListValidator";

const router = express.Router();

router.get("/sign-in/enter-email-address", showSignInFormEmail);
router.post("/sign-in/enter-email-address", emailValidator("sign-in.njk"), processEmailAddress);

router.get("/sign-in", (req, res) => {
    res.redirect(303, "/sign-in/enter-email-address");
});

router.get(
    "/sign-in/enter-password",
    emailIsPresentInSession("sign-in.njk", {errorMessages: {emailAddress: "Enter your email address"}}),
    showSignInFormPassword
);

router.post(
    "/sign-in/enter-password",
    emailIsPresentInSession("sign-in.njk", {errorMessages: {emailAddress: "Enter your email address"}}),
    processSignInForm("sign-in-enter-password.njk")
);

router.get("/sign-in/enter-text-code", showCheckPhonePage);

router.post(
    "/sign-in/enter-text-code",
    (req, res, next) => {
        res.locals.headerActiveItem = "sign-in";
        next();
    },
    mobileSecurityCodeValidator("/sign-in/resend-text-code"),
    processSecurityCode,
    finishSignIn
);

router.get("/sign-in/resend-text-code", showResendPhoneCodePage);

// TODO this only renders the page but it needs to resend the mobile OTP but we need the password to do this or find another way
router.post("/sign-in/resend-text-code", showCheckPhonePage);

router.get("/sign-in/account-not-found", (req, res) => {
    res.render("no-account-found.njk");
});

router.get(
    "/sign-in/forgot-password",
    emailIsPresentInSession("sign-in.njk", {errorMessages: {emailAddress: "Enter your email address"}}),
    forgotPasswordForm
);

router.get(
    "/sign-in/forgot-password/enter-email-code",
    emailIsPresentInSession("sign-in.njk", {errorMessages: {emailAddress: "Enter your email address"}}),
    checkEmailPasswordReset
);

router.post(
    "/sign-in/forgot-password/enter-email-code",
    emailIsPresentInSession("sign-in.njk", {errorMessages: {emailAddress: "Enter your email address"}}),
    checkEmailPasswordReset
);

router.get("/sign-in/forgot-password/create-new-password", confirmForgotPasswordForm);

router.post(
    "/sign-in/forgot-password/create-new-password",
    notOnCommonPasswordListValidator("create-new-password.njk", "password", ["password"]),
    confirmForgotPassword,
    processSignInForm("create-new-password.njk")
);

export default router;
