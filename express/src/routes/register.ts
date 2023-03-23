import express from "express";
import "express-async-errors";
import path from "path";
import {
    accountExists,
    processAddServiceForm,
    processEnterMobileForm,
    processGetEmailForm,
    resendEmailVerificationCode,
    resendMobileVerificationCode,
    showAddServiceForm,
    showCheckEmailForm,
    showEnterMobileForm,
    showGetEmailForm,
    showNewPasswordForm,
    showResendEmailCodeForm,
    showResendPhoneCodeForm,
    showSubmitMobileVerificationCode,
    submitEmailSecurityCode,
    submitMobileVerificationCode,
    updatePassword
} from "../controllers/register";
import {checkAuthorisation} from "../middleware/authoriser";
import processSignInForm from "../middleware/processSignInForm";
import {emailSecurityCodeValidator} from "../middleware/validators/emailOtpValidator";
import {emailValidator} from "../middleware/validators/emailValidator";
import {mobileSecurityCodeValidator} from "../middleware/validators/mobileOtpValidator";
import validateMobileNumber from "../middleware/validators/mobileValidator";
import notOnCommonPasswordListValidator from "../middleware/validators/notOnCommonPasswordListValidator";
import {passwordValidator} from "../middleware/validators/passwordValidator";
import {serviceNameValidator} from "../middleware/validators/serviceNameValidator";

const router = express.Router();
export default router;

router.get("/", (req, res) => {
    res.redirect(303, path.join(req.baseUrl, "/enter-email-address"));
});

router.get("/enter-email-address", showGetEmailForm);
router.post("/enter-email-address", emailValidator("create-account/get-email.njk"), processGetEmailForm);

router.get("/enter-email-code", showCheckEmailForm);
router.post("/enter-email-code", emailSecurityCodeValidator, submitEmailSecurityCode);

router.get("/resend-email-code", showResendEmailCodeForm);
router.post("/resend-email-code", resendEmailVerificationCode);

router.get("/create-password", showNewPasswordForm);
router.post(
    "/create-password",
    passwordValidator("create-account/new-password.njk"),
    notOnCommonPasswordListValidator("create-account/new-password.njk", "password", ["password"]),
    updatePassword
);

router.get("/account-exists", accountExists);
router.post("/account-exists", processSignInForm("create-account/existing-account.njk"));

router.use(checkAuthorisation);

router.get("/enter-phone-number", showEnterMobileForm);
router.post("/enter-phone-number", validateMobileNumber("create-account/enter-mobile.njk"), processEnterMobileForm);

router.get("/enter-text-code", showSubmitMobileVerificationCode);
router.post("/enter-text-code", mobileSecurityCodeValidator("resend-text-code", false), submitMobileVerificationCode);

router.get("/resend-text-code", showResendPhoneCodeForm);
router.post("/resend-text-code", resendMobileVerificationCode);

router.get("/create-service", showAddServiceForm);
router.post("/create-service", serviceNameValidator, processAddServiceForm);
