import {Router} from "express";
import {
    createNewPassword,
    createNewPasswordForm,
    enterEmailForm,
    enterPasswordForm,
    forgotPassword,
    forgotPasswordForm,
    resendTextCodeForm,
    submitEmail,
    verifyTextCode,
    verifyTextCodeForm
} from "../controllers/sign-in";
import headerActiveItem, {HeaderItem} from "../middleware/navigation";
import submitPassword from "../middleware/process-sign-in-form";
import {redirect, render} from "../middleware/request-handler";
import processSecurityCode from "../middleware/sign-in-middleware";
import checkPasswordAllowed from "../middleware/validators/common-password-validator";
import checkEmailInSession from "../middleware/validators/email-present-in-session";
import validateEmail from "../middleware/validators/email-validator";
import validateMobileSecurityCode from "../middleware/validators/mobile-code-validator";

const router = Router();
export default router;

router.use(headerActiveItem(HeaderItem.SignIn));

router.get("/", redirect("/enter-email-address", true));

router.route("/enter-email-address").get(enterEmailForm).post(validateEmail("sign-in/enter-email-address.njk"), submitEmail);

router
    .route("/enter-password")
    .get(enterPasswordForm)
    .post(
        checkEmailInSession("sign-in/enter-email-address.njk", {errorMessages: {emailAddress: "Enter your email address"}}),
        submitPassword("sign-in/enter-password.njk")
    );

router
    .route("/enter-text-code")
    .get(verifyTextCodeForm)
    .post(validateMobileSecurityCode("resend-text-code"), processSecurityCode, verifyTextCode);

router.route("/account-not-found").get(render("sign-in/account-not-found.njk"));
router.route("/resend-text-code").get(resendTextCodeForm).post(verifyTextCodeForm);

router.route("/forgot-password").get(forgotPasswordForm);

// TODO this is wrong - get and post can't be the same - fix and check this works
router
    .route("/forgot-password/enter-email-code")
    .get(forgotPassword)
    .post(
        checkEmailInSession("sign-in/enter-email-address.njk", {errorMessages: {emailAddress: "Enter your email address"}}),
        forgotPassword
    );

router
    .route("/forgot-password/create-new-password")
    .get(createNewPasswordForm)
    .post(checkPasswordAllowed("sign-in/create-new-password.njk"), createNewPassword, submitPassword("sign-in/create-new-password.njk"));
