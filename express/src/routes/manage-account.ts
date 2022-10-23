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
    verifyMobileWithSmsCode
} from "../controllers/manage-account";
import {checkAuthorisation} from "../middleware/authoriser";
import {mobileOtpValidator} from "../middleware/mobileOtpValidator";
import notOnCommonPasswordListValidator from "../middleware/notOnCommonPasswordListValidator";
import {serviceNameValidator} from "../middleware/serviceNameValidator";
import validateMobileNumber from "../middleware/mobileValidator";
import SelfServiceServicesService from "../services/self-service-services-service";
import {Client} from "../../@types/client";

const router = express.Router();

router.get("/account", checkAuthorisation, showAccount);

router.get("/account/list-services", checkAuthorisation, listServices);

router.get("/add-service-name", checkAuthorisation, showAddServiceForm);
router.post("/create-service-name-validation", checkAuthorisation, serviceNameValidator, processAddServiceForm);

router.get("/client-details/:serviceId", async (req, res) => {
    const s4: SelfServiceServicesService = req.app.get("backing-service");
    const listOfClients: Client[] = await s4.listClients(req.params.serviceId, req.session?.authenticationResult?.AccessToken as string);
    const client: Client = listOfClients[0];
    const selfServiceClientId = client.dynamoId;
    const serviceId = client.dynamoServiceId;
    const authClientId = client.authClientId;
    res.render("service-details/client-details.njk", {
        serviceId: req.params.serviceId,
        clientServiceId: serviceId,
        selfServiceClientId: selfServiceClientId,
        authClientId: authClientId,
        publicKeyAndUrlsNotUpdatedByUser: true,
        updatedField: req.session.updatedField,
        clientName: client.serviceName,
        serviceName: client.serviceName,
        clientId: client.authClientId,
        redirectUrls: client.redirectUris.join(" "),
        userAttributesRequired: client.scopes.join(", "),
        userPublicKey: client.publicKey == DEFAULT_PUBLIC_KEY ? "" : client.publicKey,
        postLogoutRedirectUrls: client.logoutUris.join(" "),
        urls: {
            changeClientName: `/change-client-name/${selfServiceClientId}/${serviceId}/${authClientId}?clientName=${encodeURI(
                client.serviceName
            )}`,
            changeRedirectUris: `/change-redirect-uris/${selfServiceClientId}/${serviceId}/${authClientId}?redirectUris=${encodeURI(
                client.redirectUris.join(" ")
            )}`,
            changeUserAttributes: `/change-user-attributes/${selfServiceClientId}/${serviceId}/${authClientId}?userAttributes=${encodeURI(
                client.scopes.join(" ")
            )}`,
            changePublicKey: `/change-public-key/${selfServiceClientId}/${serviceId}/${authClientId}?publicKey=${encodeURI(
                client.publicKey
            )}`,
            changePostLogoutUris: `/change-post-logout-uris/${selfServiceClientId}/${serviceId}/${authClientId}?redirectUris=${encodeURI(
                client.logoutUris.join(" ")
            )}`
        }
    });
    req.session.updatedField = undefined;
});

router.get("/change-password", checkAuthorisation, showChangePasswordForm);

router.post(
    "/change-password",
    checkAuthorisation,
    notOnCommonPasswordListValidator("account/change-password.njk", "password", ["currentPassword"]),
    changePassword
);

router.get("/change-phone-number", showChangePhoneNumberForm);

router.post("/change-phone-number", validateMobileNumber("account/change-phone-number.njk"), processChangePhoneNumberForm);

router.post("/verify-phone-code", mobileOtpValidator(false, "/verify-phone-code", ""), verifyMobileWithSmsCode);

router.get("/change-service-name/:serviceName/:selfServiceClientId/:authClientId/:clientServiceId", (req, res) => {
    res.render("account/change-service-name.njk", {
        serviceName: req.params.serviceName,
        clientServiceId: req.params.clientServiceId,
        selfServiceClientId: req.params.selfServiceClientId,
        clientId: req.params.authClientId
    });
});

router.post("/change-service-name", processUpdateServiceForm);

const DEFAULT_PUBLIC_KEY =
    "MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEAp2mLkQGo24Kz1rut0oZlviMkGomlQCH+iT1pFvegZFXq39NPjRWyatmXp/XIUPqCq9Kk8/+tq4Sgjw+EM5tATJ06j5r+35of58ATGVPniW//IhGizrv6/ebGcGEUJ0Y/ZmlCHYPV+lbewpttQ/IYKM1nr3k/Rl6qepbVYe+MpGubluQvdhgUYel9OzxiOvUk7XI0axPquiXzoEgmNNOai8+WhYTkBqE3/OucAv+XwXdnx4XHmKzMwTv93dYMpUmvTxWcSeEJ/4/SrbiK4PyHWVKU2BozfSUejVNhahAzZeyyDwhYJmhBaZi/3eOOlqGXj9UdkOXbl3vcwBH8wD30O9/4F5ERLKxzOaMnKZ+RpnygWF0qFhf+UeFMy+O06sdgiaFnXaSCsIy/SohspkKiLjNnhvrDNmPLMQbQKQlJdcp6zUzI7Gzys7luEmOxyMpA32lDBQcjL7KNwM15s4ytfrJ46XEPZUXESce2gj6NazcPPsrTa/Q2+oLS9GWupGh7AgMBAAE=";

export default router;
