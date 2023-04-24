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
import {checkAuthorisation} from "../middleware/authoriser";
import processSignInForm from "../middleware/processSignInForm";
import {emailSecurityCodeValidator} from "../middleware/validators/emailOtpValidator";
import {emailValidator} from "../middleware/validators/emailValidator";
import {mobileSecurityCodeValidator} from "../middleware/validators/mobileOtpValidator";
import validateMobileNumber from "../middleware/validators/mobileValidator";
import notOnCommonPasswordListValidator from "../middleware/validators/notOnCommonPasswordListValidator";
import {passwordValidator} from "../middleware/validators/passwordValidator";
import {serviceNameValidator} from "../middleware/validators/serviceNameValidator";

const router = Router();
export default router;

router.get("/", (req, res) => {
    res.redirect(303, path.join(req.baseUrl, "/enter-email-address"));
});

router.route("/enter-email-address").get(showGetEmailForm).post(emailValidator("register/enter-email-address.njk"), processGetEmailForm);
router.route("/account-exists").get(accountExists).post(processSignInForm("register/account-exists.njk"));
router.route("/enter-email-code").get(showCheckEmailForm).post(emailSecurityCodeValidator, submitEmailSecurityCode);
router.route("/resend-email-code").get(showResendEmailCodeForm).post(resendEmailVerificationCode);

router
    .route("/create-password")
    .get(showNewPasswordForm)
    .post(
        passwordValidator("register/create-password.njk"),
        notOnCommonPasswordListValidator("register/create-password.njk", "password", ["password"]),
        updatePassword
    );

router.use(checkAuthorisation);

router
    .route("/enter-phone-number")
    .get(showEnterMobileForm)
    .post(validateMobileNumber("register/enter-phone-number.njk"), processEnterMobileForm);

router
    .route("/enter-text-code")
    .get(showSubmitMobileVerificationCode)
    .post(mobileSecurityCodeValidator("resend-text-code", false), submitMobileVerificationCode);

router.route("/resend-text-code").get(showResendPhoneCodeForm).post(resendMobileVerificationCode);
router.route("/create-service").get(showAddServiceForm).post(serviceNameValidator, processAddServiceForm);
