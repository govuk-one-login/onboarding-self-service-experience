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
    processResendPhoneCodePage,
    showSignInFormEmail,
    showSignInFormPassword,
    showSignInPasswordResendTextCode,
    globalSignOut,
    showSignInFormEmailGlobalSignOut,
    organiseDynamoDBForRecoveredUser
} from "../controllers/sign-in";
import processSignInForm from "../middleware/process-sign-in-form";
import {render} from "../middleware/request-handler";
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
    .route("/enter-email-address-global-sign-out")
    .get(showSignInFormEmailGlobalSignOut)
    .post(validateEmail("sign-in/enter-email-address-global-sign-out.njk"), processEmailAddress);

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
    .route("/resend-text-code/enter-password")
    .get(
        checkEmailInSession("sign-in/enter-email-address.njk", {errorMessages: {emailAddress: "Enter your email address"}}),
        showSignInPasswordResendTextCode
    )
    .post(
        checkEmailInSession("sign-in/enter-email-address.njk", {errorMessages: {emailAddress: "Enter your email address"}}),
        processSignInForm("sign-in/resend-text-code/enter-password.njk")
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

router
    .route("/enter-text-code-then-continue-recovery")
    .get(showCheckPhonePage)
    .post(
        (req, res, next) => {
            res.locals.headerActiveItem = "sign-in";
            next();
        },
        validateMobileSecurityCode("resend-text-code"),
        processSecurityCode,
        organiseDynamoDBForRecoveredUser,
        finishSignIn
    );

router.route("/resend-text-code").get(showResendPhoneCodePage).post(processResendPhoneCodePage);
router.route("/account-not-found").get(render("sign-in/account-not-found.njk"));
router.route("/signed-in-to-another-device").get(render("sign-in/signed-in-to-another-device.njk"));
router.route("/global-sign-out").get(globalSignOut);

router
    .route("/forgot-password")
    .get(
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
