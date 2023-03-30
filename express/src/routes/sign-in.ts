import {Router} from "express";
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

const router = Router();
export default router;

router.get("/", (req, res) => {
    res.redirect(303, path.join(req.baseUrl, "/enter-email-address"));
});

router.route("/enter-email-address").get(showSignInFormEmail).post(emailValidator("sign-in.njk"), processEmailAddress);

router
    .route("/enter-password")
    .get(emailIsPresentInSession("sign-in.njk", {errorMessages: {emailAddress: "Enter your email address"}}), showSignInFormPassword)
    .post(
        emailIsPresentInSession("sign-in.njk", {errorMessages: {emailAddress: "Enter your email address"}}),
        processSignInForm("sign-in-enter-password.njk")
    );

router
    .route("/enter-text-code")
    .get(showCheckPhonePage)
    .post(
        (req, res, next) => {
            res.locals.headerActiveItem = "sign-in";
            next();
        },
        mobileSecurityCodeValidator("resend-text-code"),
        processSecurityCode,
        finishSignIn
    );

router.route("/resend-text-code").get(showResendPhoneCodePage, showCheckPhonePage);

router.get("/account-not-found", (req, res) => {
    res.render("no-account-found.njk");
});

router.get(
    "/forgot-password",
    emailIsPresentInSession("sign-in.njk", {errorMessages: {emailAddress: "Enter your email address"}}),
    forgotPasswordForm
);

// TODO this is wrong - get and post can't be the same - fix and check this works
router
    .route("/forgot-password/enter-email-code")
    .get(emailIsPresentInSession("sign-in.njk", {errorMessages: {emailAddress: "Enter your email address"}}), checkEmailPasswordReset)
    .post(emailIsPresentInSession("sign-in.njk", {errorMessages: {emailAddress: "Enter your email address"}}), checkEmailPasswordReset);

router
    .route("/forgot-password/create-new-password")
    .get(confirmForgotPasswordForm)
    .post(
        notOnCommonPasswordListValidator("create-new-password.njk", "password", ["password"]),
        confirmForgotPassword,
        processSignInForm("create-new-password.njk")
    );
