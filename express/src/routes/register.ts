import express from "express";
import "express-async-errors";
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

router.get("/register/enter-email-address", showGetEmailForm);
router.post("/register/enter-email-address", emailValidator("create-account/get-email.njk"), processGetEmailForm);

router.get("/register", (req, res) => {
    res.redirect(303, "/register/enter-email-address");
});

router.get("/register/enter-email-code", showCheckEmailForm);
router.post("/register/enter-email-code", emailSecurityCodeValidator, submitEmailSecurityCode);

router.get("/register/create-password", showNewPasswordForm);

router.post(
    "/register/create-password",
    passwordValidator("create-account/new-password.njk"),
    notOnCommonPasswordListValidator("create-account/new-password.njk", "password", ["password"]),
    updatePassword
);

router.get("/register/enter-phone-number", checkAuthorisation, showEnterMobileForm);
router.post(
    "/register/enter-phone-number",
    checkAuthorisation,
    validateMobileNumber("create-account/enter-mobile.njk"),
    processEnterMobileForm
);

router.get("/register/enter-text-code", checkAuthorisation, showSubmitMobileVerificationCode);
router.post(
    "/register/enter-text-code",
    checkAuthorisation,
    mobileSecurityCodeValidator("/register/resend-text-code", false),
    submitMobileVerificationCode
);

router.get("/register/resend-text-code", checkAuthorisation, showResendPhoneCodeForm);
router.post("/register/resend-text-code", checkAuthorisation, resendMobileVerificationCode);

router.get("/register/resend-email-code", showResendEmailCodeForm);
router.post("/register/resend-email-code", resendEmailVerificationCode);

router.get("/register/account-exists", accountExists);
router.post("/register/account-exists", processSignInForm("create-account/existing-account.njk"));

router.get("/register/create-service", checkAuthorisation, showAddServiceForm);
router.post("/register/create-service", checkAuthorisation, serviceNameValidator, processAddServiceForm);

export default router;
