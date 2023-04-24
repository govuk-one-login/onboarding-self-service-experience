import {Router} from "express";
import {
    changePostLogoutUris,
    changePublicKey,
    changeRedirectUris,
    changeServiceName,
    changeUserAttributes,
    requestPrivateBeta,
    changePostLogoutUrisForm,
    changePublicKeyForm,
    changeRedirectUrisForm,
    changeServiceNameForm,
    changeUserAttributesForm,
    showClient,
    requestPrivateBetaForm,
    privateBetaFormSubmitted
} from "../controllers/clients";
import convertPublicKeyForAuth from "../middleware/convert-public-key";
import validateUris from "../middleware/validators/uris-validator";

const router = Router();
export default router;

// TODO This should have the param /:clientId but at the moment we're abusing the fact that each service only has one client
router.get("/", showClient);

// TODO This shouldn't use the clientId - private beta is per service
router.route("/:clientId/:selfServiceClientId/private-beta").get(requestPrivateBetaForm).post(requestPrivateBeta);

router.route("/:clientId/:selfServiceClientId/private-beta/submitted").get(privateBetaFormSubmitted);

// TODO This shouldn't use the clientId - we're changing the service name
router.route("/:clientId/:selfServiceClientId/change-service-name").get(changeServiceNameForm).post(changeServiceName);

router.route("/:clientId/:selfServiceClientId/change-public-key").get(changePublicKeyForm).post(convertPublicKeyForAuth, changePublicKey);
router.route("/:clientId/:selfServiceClientId/change-user-attributes").get(changeUserAttributesForm).post(changeUserAttributes);

router
    .route("/:clientId/:selfServiceClientId/change-redirect-uris")
    .get(changeRedirectUrisForm)
    .post(validateUris("clients/change-redirect-uris.njk"), changeRedirectUris);

router
    .route("/:clientId/:selfServiceClientId/change-post-logout-uris")
    .get(changePostLogoutUrisForm)
    .post(validateUris("clients/change-post-logout-uris.njk"), changePostLogoutUris);
