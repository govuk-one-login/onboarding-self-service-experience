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
import processSignInForm from "../middleware/process-sign-in-form";
import processSecurityCode from "../middleware/sign-in-middleware";
import checkPasswordAllowed from "../middleware/validators/common-password-validator";
import checkEmailInSession from "../middleware/validators/email-present-in-session";
import validateEmail from "../middleware/validators/email-validator";
import validateMobileSecurityCode from "../middleware/validators/mobile-code-validator";

const router = Router();
export default router;

router.get("/", (req, res) => {
    res.redirect(303, path.join(req.baseUrl, "/enter-email-address"));
});

router.route("/enter-email-address").get(showSignInFormEmail).post(validateEmail("sign-in/enter-email-address.njk"), processEmailAddress);

router
    .route("/enter-password")
    .get(
        checkEmailInSession("sign-in/enter-email-address.njk", {errorMessages: {emailAddress: "Enter your email address"}}),
        showSignInFormPassword
    )
    .post(
        checkEmailInSession("sign-in/enter-email-address.njk", {errorMessages: {emailAddress: "Enter your email address"}}),
        processSignInForm("sign-in/enter-password.njk")
    );

router
    .route("/enter-text-code")
    .get(showCheckPhonePage)
    .post(
        (req, res, next) => {
            res.locals.headerActiveItem = "sign-in";
            next();
        },
        validateMobileSecurityCode("resend-text-code"),
        processSecurityCode,
        finishSignIn
    );

router.route("/resend-text-code").get(showResendPhoneCodePage).post(showCheckPhonePage);

router.get("/account-not-found", (req, res) => {
    res.render("sign-in/account-not-found.njk");
});

router.get(
    "/forgot-password",
    checkEmailInSession("sign-in/enter-email-address.njk", {errorMessages: {emailAddress: "Enter your email address"}}),
    forgotPasswordForm
);

// TODO this is wrong - get and post can't be the same - fix and check this works
router
    .route("/forgot-password/enter-email-code")
    .get(
        checkEmailInSession("sign-in/enter-email-address.njk", {errorMessages: {emailAddress: "Enter your email address"}}),
        checkEmailPasswordReset
    )
    .post(
        checkEmailInSession("sign-in/enter-email-address.njk", {errorMessages: {emailAddress: "Enter your email address"}}),
        checkEmailPasswordReset
    );

router
    .route("/forgot-password/create-new-password")
    .get(confirmForgotPasswordForm)
    .post(
        checkPasswordAllowed("sign-in/create-new-password.njk"),
        confirmForgotPassword,
        processSignInForm("sign-in/create-new-password.njk")
    );
