import {Router} from "express";
import path from "path";
import {
    accountExists,
    processAddServiceForm,
    processEnterMobileForm,
    processGetEmailForm,
    redirectToServicesList,
    resendEmailVerificationCode,
    resendMobileVerificationCode,
    resumeAfterPassword,
    resumeUserJourneyAfterPassword,
    sendDataToUserSpreadsheet,
    showAddServiceForm,
    showCheckEmailForm,
    showEnterMobileForm,
    showGetEmailForm,
    showNewPasswordForm,
    showResendEmailCodeForm,
    showResendPhoneCodeForm,
    showSubmitMobileVerificationCode,
    showTooManyCodes,
    submitEmailSecurityCode,
    submitMobileVerificationCode,
    updatePassword
} from "../controllers/register.js";
import checkAuthorisation from "../middleware/authoriser.js";
import processSignInForm from "../middleware/process-sign-in-form.js";
import checkPasswordAllowed from "../middleware/validators/common-password-validator.js";
import validateEmailSecurityCode from "../middleware/validators/email-code-validator.js";
import validateEmail from "../middleware/validators/email-validator.js";
import validateMobileSecurityCode from "../middleware/validators/mobile-code-validator.js";
import validateMobileNumber from "../middleware/validators/mobile-number-validator.js";
import validatePassword from "../middleware/validators/password-validator.js";
import validateServiceName from "../middleware/validators/service-name-validator.js";
import {allowUserJourneyMiddleware} from "../middleware/allow-user-journey-middleware.js";

const router = Router();
export default router;

router.get("/", (req, res) => {
    res.redirect(303, path.join(req.baseUrl, "/enter-email-address"));
});

router.route("/enter-email-address").get(showGetEmailForm).post(validateEmail("register/enter-email-address.njk"), processGetEmailForm);
router.route("/account-exists").get(allowUserJourneyMiddleware, accountExists).post(processSignInForm("register/account-exists.njk"));
router
    .route("/enter-email-code")
    .get(allowUserJourneyMiddleware, showCheckEmailForm)
    .post(validateEmailSecurityCode, submitEmailSecurityCode);
router.route("/resend-email-code").get(allowUserJourneyMiddleware, showResendEmailCodeForm).post(resendEmailVerificationCode);

router.route("/too-many-codes").get(allowUserJourneyMiddleware, showTooManyCodes);

router
    .route("/create-password")
    .get(allowUserJourneyMiddleware, showNewPasswordForm)
    .post(validatePassword("register/create-password.njk"), checkPasswordAllowed("register/create-password.njk"), updatePassword);

router
    .route("/enter-phone-number")
    .get(allowUserJourneyMiddleware, checkAuthorisation, showEnterMobileForm)
    .post(validateMobileNumber("register/enter-phone-number.njk"), processEnterMobileForm);

router
    .route("/enter-text-code")
    .get(allowUserJourneyMiddleware, checkAuthorisation, showSubmitMobileVerificationCode)
    .post(validateMobileSecurityCode("resend-text-code", false), submitMobileVerificationCode);

router
    .route("/resend-text-code")
    .get(allowUserJourneyMiddleware, checkAuthorisation, showResendPhoneCodeForm)
    .post(resendMobileVerificationCode);
router
    .route("/create-service")
    .get(allowUserJourneyMiddleware, checkAuthorisation, showAddServiceForm)
    .post(validateServiceName("register/add-service-name.njk"), processAddServiceForm, sendDataToUserSpreadsheet, redirectToServicesList);

router
    .route("/resume-before-password")
    .get(allowUserJourneyMiddleware, showCheckEmailForm)
    .post(validateEmailSecurityCode, submitEmailSecurityCode);
router.route("/resume-after-password").get(allowUserJourneyMiddleware, resumeAfterPassword).post(resumeUserJourneyAfterPassword);
