import express from "express";
import path from "path";
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

router.get("/", (req, res) => {
    res.redirect(303, path.join(req.baseUrl, "/enter-email-address"));
});

router.get("/enter-email-address", showSignInFormEmail);
router.post("/enter-email-address", emailValidator("sign-in.njk"), processEmailAddress);

router.get(
    "/enter-password",
    emailIsPresentInSession("sign-in.njk", {errorMessages: {emailAddress: "Enter your email address"}}),
    showSignInFormPassword
);

router.post(
    "/enter-password",
    emailIsPresentInSession("sign-in.njk", {errorMessages: {emailAddress: "Enter your email address"}}),
    processSignInForm("sign-in-enter-password.njk")
);

router.get("/enter-text-code", showCheckPhonePage);
router.post(
    "/enter-text-code",
    (req, res, next) => {
        res.locals.headerActiveItem = "sign-in";
        next();
    },
    mobileSecurityCodeValidator("resend-text-code"),
    processSecurityCode,
    finishSignIn
);

router.get("/resend-text-code", showResendPhoneCodePage);
router.post("/resend-text-code", showCheckPhonePage);

router.get("/account-not-found", (req, res) => {
    res.render("no-account-found.njk");
});

router.get(
    "/forgot-password",
    emailIsPresentInSession("sign-in.njk", {errorMessages: {emailAddress: "Enter your email address"}}),
    forgotPasswordForm
);

router.get(
    "/forgot-password/enter-email-code",
    emailIsPresentInSession("sign-in.njk", {errorMessages: {emailAddress: "Enter your email address"}}),
    checkEmailPasswordReset
);

router.post(
    "/forgot-password/enter-email-code",
    emailIsPresentInSession("sign-in.njk", {errorMessages: {emailAddress: "Enter your email address"}}),
    checkEmailPasswordReset
);

router.get("/forgot-password/create-new-password", confirmForgotPasswordForm);
router.post(
    "/forgot-password/create-new-password",
    notOnCommonPasswordListValidator("create-new-password.njk", "password", ["password"]),
    confirmForgotPassword,
    processSignInForm("create-new-password.njk")
);

export default router;
