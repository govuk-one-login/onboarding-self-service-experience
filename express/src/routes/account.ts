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
export default router;

router.use(checkAuthorisation);

router.get("/", showAccount);

router.get("/change-password", showChangePasswordForm);
router.post(
    "/change-password",
    notOnCommonPasswordListValidator("account/change-password.njk", "newPassword", ["currentPassword"]),
    changePassword
);

router.get("/change-phone-number", showChangePhoneNumberForm);
router.post("/change-phone-number", validateMobileNumber("account/change-phone-number.njk"), processChangePhoneNumberForm);

router.get("/change-phone-number/enter-text-code", showVerifyMobileWithSmsCode);
router.post(
    "/change-phone-number/enter-text-code",
    // TODO refactor routers
    (req, res, next) => {
        res.locals.headerActiveItem = "your-account";
        next();
    },
    mobileSecurityCodeValidator("resend-text-code", false),
    verifyMobileWithSmsCode
);

router.get("/change-phone-number/resend-text-code", (req, res) => {
    res.render("common/resend-security-code.njk", {
        securityCodeMethod: "phone"
    });
});

router.post("/change-phone-number/resend-text-code", (req, res) => {
    res.redirect("change-phone-number/enter-text-code");
});
