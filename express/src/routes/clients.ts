import {Router} from "express";
import {
    processChangePostLogoutUrisForm,
    processChangePublicKeyForm,
    processChangeRedirectUrlsForm,
    processChangeServiceNameForm,
    processChangeUserAttributesForm,
    processPrivateBetaForm,
    showClient,
    showPrivateBetaForm,
    showPrivateBetaFormSubmitted,
    showProcessChangePostLogoutUrisForm,
    showProcessChangePublicKeyForm,
    showProcessChangeRedirectUrlsForm,
    showProcessChangeServiceNameForm,
    showProcessChangeUserAttributesForm
} from "../controllers/clients";
import convertPublicKeyForAuth from "../middleware/convert-public-key";
import validateUris from "../middleware/validators/uris-validator";

const router = Router();
export default router;

// TODO This should have the param /:clientId but at the moment we're abusing the fact that each service only has one client
router.get("/", showClient);

// TODO This shouldn't use the clientId - private beta is per service
router.route("/:clientId/:selfServiceClientId/private-beta").get(showPrivateBetaForm).post(processPrivateBetaForm);

router.get("/:clientId/:selfServiceClientId/private-beta/submitted", showPrivateBetaFormSubmitted);

// TODO This shouldn't use the clientId - we're changing the service name
router
    .route("/:clientId/:selfServiceClientId/change-service-name")
    .get(showProcessChangeServiceNameForm)
    .post(processChangeServiceNameForm);

router
    .route("/:clientId/:selfServiceClientId/change-public-key")
    .get(showProcessChangePublicKeyForm)
    .post(convertPublicKeyForAuth, processChangePublicKeyForm);

router
    .route("/:clientId/:selfServiceClientId/change-redirect-uris")
    .get(showProcessChangeRedirectUrlsForm)
    .post(validateUris("clients/change-redirect-uris.njk"), processChangeRedirectUrlsForm);

router
    .route("/:clientId/:selfServiceClientId/change-user-attributes")
    .get(showProcessChangeUserAttributesForm)
    .post(processChangeUserAttributesForm);

router
    .route("/:clientId/:selfServiceClientId/change-post-logout-uris")
    .get(showProcessChangePostLogoutUrisForm)
    .post(validateUris("clients/change-post-logout-uris.njk"), processChangePostLogoutUrisForm);
