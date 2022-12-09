import express from "express";
import {
    changePassword,
    listServices,
    processAddServiceForm,
    processChangePhoneNumberForm,
    processChangeServiceNameForm,
    processPrivateBetaForm,
    showAccount,
    showAddServiceForm,
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
import {serviceNameValidator} from "../middleware/validators/serviceNameValidator";

const router = express.Router();

router.get("/account", checkAuthorisation, showAccount);

router.get("/account/list-services", checkAuthorisation, listServices);

router.get("/add-service-name", checkAuthorisation, showAddServiceForm);
router.post("/add-service-name", checkAuthorisation, serviceNameValidator, processAddServiceForm);

// TODO This should have params :serviceId/:clientId but at the moment we're abusing the fact that each service only has one client
router.get("/client-details/:serviceId", checkAuthorisation, showClient);

router.get("/private-beta/:serviceId/:selfServiceClientId/:clientId", checkAuthorisation, showPrivateBetaForm);
router.post("/private-beta/:serviceId/:selfServiceClientId/:clientId", checkAuthorisation, processPrivateBetaForm);
router.get("/private-beta-form-submitted/:serviceId/:selfServiceClientId/:clientId", checkAuthorisation, showPrivateBetaFormSubmitted);

router.get("/change-password", checkAuthorisation, showChangePasswordForm);

router.post(
    "/change-password",
    checkAuthorisation,
    notOnCommonPasswordListValidator("account/change-password.njk", "password", ["currentPassword"]),
    changePassword
);

router.get("/change-phone-number", checkAuthorisation, showChangePhoneNumberForm);

router.post(
    "/change-phone-number",
    checkAuthorisation,
    validateMobileNumber("account/change-phone-number.njk"),
    processChangePhoneNumberForm
);

router.get("/account/verify-phone-code", checkAuthorisation, showVerifyMobileWithSmsCode);

router.post(
    "/account/verify-phone-code",
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

router.get("/account/resend-phone-code", checkAuthorisation, (req, res) => {
    res.render("common/resend-security-code.njk", {
        securityCodeMethod: "phone"
    });
});

router.post("/account/resend-phone-code", (req, res) => {
    res.redirect("/account/verify-phone-code");
});

export default router;
