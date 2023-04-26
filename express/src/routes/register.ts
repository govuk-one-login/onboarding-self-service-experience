import {Router} from "express";
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
import checkAuthorisation from "../middleware/authoriser";
import processSignInForm from "../middleware/process-sign-in-form";
import checkPasswordAllowed from "../middleware/validators/common-password-validator";
import validateEmailSecurityCode from "../middleware/validators/email-code-validator";
import validateEmail from "../middleware/validators/email-validator";
import validateMobileSecurityCode from "../middleware/validators/mobile-code-validator";
import validateMobileNumber from "../middleware/validators/mobile-number-validator";
import validatePassword from "../middleware/validators/password-validator";
import validateServiceName from "../middleware/validators/service-name-validator";

const router = Router();
export default router;

router.get("/", (req, res) => {
    res.redirect(303, path.join(req.baseUrl, "/enter-email-address"));
});

router.route("/enter-email-address").get(showGetEmailForm).post(validateEmail("register/enter-email-address.njk"), processGetEmailForm);
router.route("/account-exists").get(accountExists).post(processSignInForm("register/account-exists.njk"));
router.route("/enter-email-code").get(showCheckEmailForm).post(validateEmailSecurityCode, submitEmailSecurityCode);
router.route("/resend-email-code").get(showResendEmailCodeForm).post(resendEmailVerificationCode);

router
    .route("/create-password")
    .get(showNewPasswordForm)
    .post(validatePassword("register/create-password.njk"), checkPasswordAllowed("register/create-password.njk"), updatePassword);

router.use(checkAuthorisation);

router
    .route("/enter-phone-number")
    .get(showEnterMobileForm)
    .post(validateMobileNumber("register/enter-phone-number.njk"), processEnterMobileForm);

router
    .route("/enter-text-code")
    .get(showSubmitMobileVerificationCode)
    .post(validateMobileSecurityCode("resend-text-code", false), submitMobileVerificationCode);

router.route("/resend-text-code").get(showResendPhoneCodeForm).post(resendMobileVerificationCode);
router.route("/create-service").get(showAddServiceForm).post(validateServiceName, processAddServiceForm);
