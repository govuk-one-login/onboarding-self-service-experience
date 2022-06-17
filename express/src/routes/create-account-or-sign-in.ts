


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

const router = express.Router();

router.get('/create-account-or-sign-in', (req: Request, res: Response) => {
    res.render('create-account-or-sign-in.njk');
});
router.get('/create/get-email', showGetEmailForm);
router.post('/create/get-email', emailValidator, processGetEmailForm);

router.get('/create/check-email', showCheckEmailForm);
router.post('/create/check-email', checkEmailOtp);

router.get('/create/update-password', showNewPasswordForm);
router.post('/create/update-password', passwordValidator, updatePassword);

router.get('/create/enter-mobile', showEnterMobileForm);
router.post('/create/enter-mobile', mobileValidator, processEnterMobileForm);

router.post('/create/verify-phone-code', mobileOtpValidator('create-account/check-mobile.njk'), submitMobileVerificationCode);

router.get('/there-is-a-problem', (req: Request, res: Response) => {
    res.render('there-is-a-problem.njk');
});

router.get('/create/resend-phone-code', showResendPhoneCodeForm);
router.post('/create/resend-phone-code', resendMobileVerificationCode);

router.get('/create/resend-email-code', showResendEmailCodeForm);
router.post('/create/resend-email-code', resendEmailVerificationCode);

export default router;
