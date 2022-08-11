


import express, {Request, Response} from "express";
import {
    processGetEmailForm,
    showCheckEmailForm,
    showGetEmailForm,
    showNewPasswordForm,
    updatePassword,
    showEnterMobileForm,
    processEnterMobileForm, submitMobileVerificationCode, checkEmailOtp,
    showResendPhoneCodeForm, resendMobileVerificationCode,
    showResendEmailCodeForm, resendEmailVerificationCode
} from "../controllers/create-account";
import {emailValidator} from "../middleware/emailValidator";
import {mobileValidator} from "../middleware/mobileValidator";
import {mobileOtpValidator} from "../middleware/mobileOtpValidator";
import {passwordValidator} from "../middleware/passwordValidator";
import notOnCommonPasswordListValidator from "../middleware/notOnCommonPasswordListValidator";

const router = express.Router();

router.get('/create/get-email', showGetEmailForm);
router.post('/create/get-email', emailValidator('create-account/get-email.njk'), processGetEmailForm);

router.get('/create/check-email', showCheckEmailForm);
router.post('/create/check-email', checkEmailOtp);

router.get('/create/update-password', showNewPasswordForm);
router.post('/create/update-password', passwordValidator('create-account/new-password.njk', false), notOnCommonPasswordListValidator('create-account/new-password.njk', 'password'), updatePassword);

router.get('/create/enter-mobile', showEnterMobileForm);
router.post('/create/enter-mobile', mobileValidator, processEnterMobileForm);

router.post('/create/verify-phone-code', mobileOtpValidator(false, '/create/verify-phone-code'), submitMobileVerificationCode);

router.get('/there-is-a-problem', (req: Request, res: Response) => {
    res.render('there-is-a-problem.njk');
});

router.get('/create/resend-phone-code', showResendPhoneCodeForm);
router.post('/create/resend-phone-code', resendMobileVerificationCode);

router.get('/create/resend-email-code', showResendEmailCodeForm);
router.post('/create/resend-email-code', resendEmailVerificationCode);

export default router;
