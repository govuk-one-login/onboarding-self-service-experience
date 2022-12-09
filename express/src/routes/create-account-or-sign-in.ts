import express, {Request, Response} from "express";
import "express-async-errors";
import {
    processEnterMobileForm,
    processGetEmailForm,
    resendEmailVerificationCode,
    resendMobileVerificationCode,
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
} from "../controllers/create-account";
import {checkAuthorisation} from "../middleware/authoriser";
import {emailSecurityCodeValidator} from "../middleware/validators/emailOtpValidator";
import {emailValidator} from "../middleware/validators/emailValidator";
import {mobileSecurityCodeValidator} from "../middleware/validators/mobileOtpValidator";
import validateMobileNumber from "../middleware/validators/mobileValidator";
import notOnCommonPasswordListValidator from "../middleware/validators/notOnCommonPasswordListValidator";
import {passwordValidator} from "../middleware/validators/passwordValidator";

const router = express.Router();

router.get("/create/get-email", showGetEmailForm);
router.post("/create/get-email", emailValidator("create-account/get-email.njk"), processGetEmailForm);

router.get("/create/check-email", showCheckEmailForm);
router.post("/create/check-email", emailSecurityCodeValidator, submitEmailSecurityCode);

router.get("/create/update-password", showNewPasswordForm);

router.post(
    "/create/update-password",
    passwordValidator("create-account/new-password.njk"),
    notOnCommonPasswordListValidator("create-account/new-password.njk", "password", ["password"]),
    updatePassword
);

router.get("/create/enter-mobile", checkAuthorisation, showEnterMobileForm);
router.post("/create/enter-mobile", checkAuthorisation, validateMobileNumber("create-account/enter-mobile.njk"), processEnterMobileForm);

router.get("/create/verify-phone-code", checkAuthorisation, showSubmitMobileVerificationCode);
router.post(
    "/create/verify-phone-code",
    checkAuthorisation,
    mobileSecurityCodeValidator("/create/resend-phone-code", false),
    submitMobileVerificationCode
);

router.get("/there-is-a-problem", (req: Request, res: Response) => {
    res.render("there-is-a-problem.njk");
});

router.get("/create/resend-phone-code", checkAuthorisation, showResendPhoneCodeForm);
router.post("/create/resend-phone-code", checkAuthorisation, resendMobileVerificationCode);

router.get("/create/resend-email-code", showResendEmailCodeForm);
router.post("/create/resend-email-code", resendEmailVerificationCode);

export default router;
