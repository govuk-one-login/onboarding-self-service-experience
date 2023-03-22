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

router.get("/", (req, res) => {
    res.redirect(303, path.join(req.baseUrl, "/enter-email-address"));
});

router.get("/enter-email-address", showGetEmailForm);
router.post("/enter-email-address", emailValidator("create-account/get-email.njk"), processGetEmailForm);

router.get("/enter-email-code", showCheckEmailForm);
router.post("/enter-email-code", emailSecurityCodeValidator, submitEmailSecurityCode);

router.get("/create-password", showNewPasswordForm);
router.post(
    "/create-password",
    passwordValidator("create-account/new-password.njk"),
    notOnCommonPasswordListValidator("create-account/new-password.njk", "password", ["password"]),
    updatePassword
);

router.get("/enter-phone-number", checkAuthorisation, showEnterMobileForm);
router.post("/enter-phone-number", checkAuthorisation, validateMobileNumber("create-account/enter-mobile.njk"), processEnterMobileForm);

router.get("/enter-text-code", checkAuthorisation, showSubmitMobileVerificationCode);
router.post(
    "/enter-text-code",
    checkAuthorisation,
    mobileSecurityCodeValidator("resend-text-code", false),
    submitMobileVerificationCode
);

router.get("/resend-text-code", checkAuthorisation, showResendPhoneCodeForm);
router.post("/resend-text-code", checkAuthorisation, resendMobileVerificationCode);

router.get("/resend-email-code", showResendEmailCodeForm);
router.post("/resend-email-code", resendEmailVerificationCode);

router.get("/account-exists", accountExists);
router.post("/account-exists", processSignInForm("create-account/existing-account.njk"));

router.get("/create-service", checkAuthorisation, showAddServiceForm);
router.post("/create-service", checkAuthorisation, serviceNameValidator, processAddServiceForm);

export default router;
