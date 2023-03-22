import express from "express";
import {
    changePassword,
    processChangePhoneNumberForm,
    showAccount,
    showChangePasswordForm,
    showChangePhoneNumberForm,
    showVerifyMobileWithSmsCode,
    verifyMobileWithSmsCode
} from "../controllers/account";
import {checkAuthorisation} from "../middleware/authoriser";
import {mobileSecurityCodeValidator} from "../middleware/validators/mobileOtpValidator";
import validateMobileNumber from "../middleware/validators/mobileValidator";
import notOnCommonPasswordListValidator from "../middleware/validators/notOnCommonPasswordListValidator";

const router = express.Router();

router.get("/account", checkAuthorisation, showAccount);

router.get("/account/change-password", checkAuthorisation, showChangePasswordForm);

router.post(
    "/account/change-password",
    checkAuthorisation,
    notOnCommonPasswordListValidator("account/change-password.njk", "newPassword", ["currentPassword"]),
    changePassword
);

router.get("/account/change-phone-number", checkAuthorisation, showChangePhoneNumberForm);

router.post(
    "/account/change-phone-number",
    checkAuthorisation,
    validateMobileNumber("account/change-phone-number.njk"),
    processChangePhoneNumberForm
);

router.get("/account/change-phone-number/enter-text-code", checkAuthorisation, showVerifyMobileWithSmsCode);

router.post(
    "/account/change-phone-number/enter-text-code",
    checkAuthorisation,
    // TODO refactor routers
    (req, res, next) => {
        res.locals.headerActiveItem = "your-account";
        next();
    },
    mobileSecurityCodeValidator("/verify-phone-code", false),
    verifyMobileWithSmsCode
);

router.get("/account/change-phone-number/resend-text-code", checkAuthorisation, (req, res) => {
    res.render("common/resend-security-code.njk", {
        securityCodeMethod: "phone"
    });
});

router.post("/account/change-phone-number/resend-text-code", (req, res) => {
    res.redirect("/account/change-phone-number/enter-text-code");
});

export default router;
