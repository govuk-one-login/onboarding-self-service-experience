import {Router} from "express";
import {
    accountExists,
    createPassword,
    createPasswordForm,
    createService,
    createServiceForm,
    enterEmailCodeForm,
    enterEmailForm,
    enterPhoneNumberForm,
    enterTextCodeForm,
    resendEmailCode,
    resendEmailCodeForm,
    resendTextCode,
    resendTextCodeForm,
    submitEmail,
    submitEmailCode,
    submitPhoneNumber,
    submitTextCode
} from "../controllers/register";
import checkAuthorisation from "../middleware/authoriser";
import processSignInForm from "../middleware/process-sign-in-form";
import {redirect} from "../middleware/request-handler";
import checkPasswordAllowed from "../middleware/validators/common-password-validator";
import validateEmailSecurityCode from "../middleware/validators/email-code-validator";
import validateEmail from "../middleware/validators/email-validator";
import validateMobileSecurityCode from "../middleware/validators/mobile-code-validator";
import validateMobileNumber from "../middleware/validators/mobile-number-validator";
import validatePassword from "../middleware/validators/password-validator";
import validateServiceName from "../middleware/validators/service-name-validator";

const router = Router();
export default router;

router.get("/", redirect("/enter-email-address", true));

router.route("/enter-email-address").get(enterEmailForm).post(validateEmail("register/enter-email-address.njk"), submitEmail);

// TODO reuse sign-in code
router.route("/account-exists").get(accountExists).post(processSignInForm("register/account-exists.njk"));

router.route("/enter-email-code").get(enterEmailCodeForm).post(validateEmailSecurityCode, submitEmailCode);
router.route("/resend-email-code").get(resendEmailCodeForm).post(resendEmailCode);

router
    .route("/create-password")
    .get(createPasswordForm)
    .post(validatePassword("register/create-password.njk"), checkPasswordAllowed("register/create-password.njk"), createPassword);

router.use(checkAuthorisation);

router
    .route("/enter-phone-number")
    .get(enterPhoneNumberForm)
    .post(validateMobileNumber("register/enter-phone-number.njk"), submitPhoneNumber);

router.route("/enter-text-code").get(enterTextCodeForm).post(validateMobileSecurityCode("resend-text-code", false), submitTextCode);
router.route("/resend-text-code").get(resendTextCodeForm).post(resendTextCode);

router.route("/create-service").get(createServiceForm).post(validateServiceName, createService);
