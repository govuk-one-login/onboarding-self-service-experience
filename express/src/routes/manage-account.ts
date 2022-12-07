import express from "express";
import {
    changePassword,
    listServices,
    processAddServiceForm,
    processChangePhoneNumberForm,
    processUpdateServiceForm,
    showAccount,
    showAddServiceForm,
    showChangePasswordForm,
    showChangePhoneNumberForm,
    showClient,
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

router.get("/change-password", checkAuthorisation, showChangePasswordForm);

router.post(
    "/change-password",
    checkAuthorisation,
    notOnCommonPasswordListValidator("account/change-password.njk", "password", ["currentPassword"]),
    changePassword
);

router.get("/change-phone-number", showChangePhoneNumberForm);

router.post("/change-phone-number", validateMobileNumber("account/change-phone-number.njk"), processChangePhoneNumberForm);

router.post("/verify-phone-code", mobileOtpValidator("/verify-phone-code", ""), verifyMobileWithSmsCode);

router.get("/change-service-name/:serviceName/:selfServiceClientId/:authClientId/:clientServiceId", (req, res) => {
    res.render("account/change-service-name.njk", {
        values: {
            serviceName: req.params.serviceName,
            clientServiceId: req.params.clientServiceId,
            selfServiceClientId: req.params.selfServiceClientId,
            clientId: req.params.authClientId
        }
    });
});

router.post("/change-service-name", processUpdateServiceForm);

export default router;
