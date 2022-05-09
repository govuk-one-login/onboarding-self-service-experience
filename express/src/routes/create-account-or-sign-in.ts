import express, {Request, Response} from "express";
import {
    processGetEmailForm,
    showCheckEmailForm,
    showGetEmailForm,
    showNewPasswordForm,
    updatePassword,
    showEnterMobileForm,
    processEnterMobileForm, submitMobileVerificationCode
} from "../controllers/create-account";

const router = express.Router();

router.get('/create-account-or-sign-in', (req: Request, res: Response) => {
    res.render('create-account-or-sign-in.njk');
});
router.get('/create/get-email', showGetEmailForm);
router.post('/create/get-email', processGetEmailForm);

router.get('/create/check-email', showCheckEmailForm);
router.post('/create/check-email', showNewPasswordForm);

router.post('/create/update-password', updatePassword);

router.get('/create/enter-mobile', showEnterMobileForm);
router.post('/create/enter-mobile', processEnterMobileForm);

router.post('/create/verify-phone-code', submitMobileVerificationCode);


export default router;