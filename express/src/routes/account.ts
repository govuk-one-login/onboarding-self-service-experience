import {Router} from "express";
import {
    changePassword,
    processChangePhoneNumberForm,
    showAccount,
    showChangePasswordForm,
    showChangePhoneNumberForm,
    showVerifyMobileWithSmsCode,
    verifyMobileWithSmsCode
} from "../controllers/account";
import checkAuthorisation from "../middleware/authoriser";
import checkPasswordAllowed from "../middleware/validators/common-password-validator";
import validateMobileSecurityCode from "../middleware/validators/mobile-code-validator";
import validateMobileNumber from "../middleware/validators/mobile-number-validator";

const router = Router();
export default router;

router.use(checkAuthorisation);

router.get("/", showAccount);

router
    .route("/change-password")
    .get(showChangePasswordForm)
    .post(checkPasswordAllowed("account/change-password.njk", "newPassword", ["currentPassword"]), changePassword);

router
    .route("/change-phone-number")
    .get(showChangePhoneNumberForm)
    .post(validateMobileNumber("account/change-phone-number.njk"), processChangePhoneNumberForm);

router
    .route("/change-phone-number/enter-text-code")
    .get(showVerifyMobileWithSmsCode)
    .post(
        // TODO refactor routers
        (req, res, next) => {
            res.locals.headerActiveItem = "your-account";
            next();
        },
        validateMobileSecurityCode("resend-text-code", false),
        verifyMobileWithSmsCode
    );

router
    .route("/change-phone-number/resend-text-code")
    .get((req, res) => {
        res.render("common/resend-security-code.njk", {
            securityCodeMethod: "phone"
        });
    })
    .post((req, res) => {
        res.redirect("change-phone-number/enter-text-code");
    });
