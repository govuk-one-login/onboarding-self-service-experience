import express from "express";
import {
    changePassword,
    listServices,
    processChangePhoneNumberForm,
    processChangeServiceNameForm,
    processPrivateBetaForm,
    showAccount,
    showChangePasswordForm,
    showChangePhoneNumberForm,
    showClient,
    showPrivateBetaForm,
    showPrivateBetaFormSubmitted,
    showVerifyMobileWithSmsCode,
    verifyMobileWithSmsCode
} from "../controllers/manage-account";
import {checkAuthorisation} from "../middleware/authoriser";
import {mobileSecurityCodeValidator} from "../middleware/validators/mobileOtpValidator";
import validateMobileNumber from "../middleware/validators/mobileValidator";
import notOnCommonPasswordListValidator from "../middleware/validators/notOnCommonPasswordListValidator";

const router = express.Router();

router.get("/account", checkAuthorisation, showAccount);

router.get("/services", checkAuthorisation, listServices);

// TODO This should have params :serviceId/:clientId but at the moment we're abusing the fact that each service only has one client
router.get("/services/:serviceId/client", checkAuthorisation, showClient);

router.get("/service/:serviceId/client/:clientId/:selfServiceClientId/private-beta", checkAuthorisation, showPrivateBetaForm);
router.post("/service/:serviceId/client/:clientId/:selfServiceClientId/private-beta", checkAuthorisation, processPrivateBetaForm);
router.get(
    "/service/:serviceId/client/:clientId/:selfServiceClientId/private-beta/submitted",
    checkAuthorisation,
    showPrivateBetaFormSubmitted
);

router.get("/change-password", checkAuthorisation, showChangePasswordForm);

router.post(
    "/change-password",
    checkAuthorisation,
    notOnCommonPasswordListValidator("account/change-password.njk", "newPassword", ["currentPassword"]),
    changePassword
);

router.get("/change-phone-number", checkAuthorisation, showChangePhoneNumberForm);

router.post(
    "/change-phone-number",
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

router.get("/change-service-name/:serviceId/:selfServiceClientId/:clientId", checkAuthorisation, (req, res) => {
    res.render("account/change-service-name.njk", {
        serviceId: req.params.serviceId,
        values: {
            serviceName: req.query.serviceName
        }
    });
});

router.post("/change-service-name/:serviceId/:selfServiceClientId/:clientId", checkAuthorisation, processChangeServiceNameForm);

router.get("/account/change-phone-number/resend-text-code", checkAuthorisation, (req, res) => {
    res.render("common/resend-security-code.njk", {
        securityCodeMethod: "phone"
    });
});

router.post("/account/change-phone-number/resend-text-code", (req, res) => {
    res.redirect("/account/change-phone-number/enter-text-code");
});

export default router;
