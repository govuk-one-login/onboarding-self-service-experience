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
    verifyMobileWithSmsCode
} from "../controllers/manage-account";
import {checkAuthorisation} from "../middleware/authoriser";
import {mobileOtpValidator} from "../middleware/validators/mobileOtpValidator";
import validateMobileNumber from "../middleware/validators/mobileValidator";
import notOnCommonPasswordListValidator from "../middleware/validators/notOnCommonPasswordListValidator";
import {serviceNameValidator} from "../middleware/validators/serviceNameValidator";

const router = express.Router();

router.get("/account", checkAuthorisation, showAccount);

router.get("/account/list-services", checkAuthorisation, listServices);

router.get("/add-service-name", checkAuthorisation, showAddServiceForm);
router.post("/create-service-name-validation", checkAuthorisation, serviceNameValidator, processAddServiceForm);

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

router.post("/verify-phone-code", checkAuthorisation, mobileOtpValidator("/verify-phone-code", ""), verifyMobileWithSmsCode);

router.get("/change-service-name/:serviceId/:selfServiceClientId/:clientId", checkAuthorisation, (req, res) => {
    res.render("account/change-service-name.njk", {
        serviceId: req.params.serviceId,
        values: {
            serviceName: req.query.serviceName
        }
    });
});

router.post("/change-service-name/:serviceId/:selfServiceClientId/:clientId", checkAuthorisation, processChangeServiceNameForm);

export default router;
