import {Router} from "express";
import {
    processChangePostLogoutUrisForm,
    processChangePublicKeyForm,
    processChangeRedirectUrlsForm,
    processChangeServiceNameForm,
    processChangeUserAttributesForm,
    processPrivateBetaForm,
    showChangePostLogoutUrisForm,
    showChangePublicKeyForm,
    showChangeRedirectUrlsForm,
    showChangeServiceNameForm,
    showChangeUserAttributesForm,
    showClient,
    showPrivateBetaForm,
    showPrivateBetaFormSubmitted
} from "../controllers/clients";
import convertPublicKeyForAuth from "../middleware/convert-public-key";
import validateUris from "../middleware/validators/uris-validator";

const router = Router();
export default router;

// TODO This should have the param /:clientId but at the moment we're abusing the fact that each service only has one client
router.get("/", showClient);

// TODO This shouldn't use the clientId - public beta is per service
router.route("/:clientId/:selfServiceClientId/public-beta").get(showPrivateBetaForm).post(processPrivateBetaForm);

router.route("/:clientId/:selfServiceClientId/public-beta/submitted").get(showPrivateBetaFormSubmitted);

// TODO This shouldn't use the clientId - we're changing the service name
router.route("/:clientId/:selfServiceClientId/change-service-name").get(showChangeServiceNameForm).post(processChangeServiceNameForm);

router
    .route("/:clientId/:selfServiceClientId/change-public-key")
    .get(showChangePublicKeyForm)
    .post(convertPublicKeyForAuth, processChangePublicKeyForm);

router
    .route("/:clientId/:selfServiceClientId/change-redirect-uris")
    .get(showChangeRedirectUrlsForm)
    .post(validateUris("clients/change-redirect-uris.njk"), processChangeRedirectUrlsForm);

router
    .route("/:clientId/:selfServiceClientId/change-user-attributes")
    .get(showChangeUserAttributesForm)
    .post(processChangeUserAttributesForm);

router
    .route("/:clientId/:selfServiceClientId/change-post-logout-uris")
    .get(showChangePostLogoutUrisForm)
    .post(validateUris("clients/change-post-logout-uris.njk"), processChangePostLogoutUrisForm);
