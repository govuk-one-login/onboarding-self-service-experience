import {Router} from "express";
import {
    processChangeBackChannelLogOutUriForm,
    showAddPostLogoutUriForm,
    processChangePublicKeyForm,
    processChangeSectorIdentifierUriForm,
    processChangeServiceNameForm,
    processChangeScopesForm,
    processConfirmContactRemovalForm,
    processEnterContactEmailForm,
    processEnterClientSecretHashForm,
    showChangeBackChannelLogoutUriForm,
    showChangePostLogoutUrisForm,
    showChangePublicKeyForm,
    showChangeRedirectUrlsForm,
    showChangeSectorIdentifierUriForm,
    showChangeServiceNameForm,
    showChangeScopesForm,
    showClient,
    showConfirmContactRemovalForm,
    showEnterClientSecretHashForm,
    showEnterContactEmailForm,
    showEnterContactForm,
    showGoLivePage,
    showChangeClaimsForm,
    processChangeClaimsForm,
    processAddPostLogoutUriForm,
    showConfirmPostLogoutUriRemovalForm,
    processRemovePostLogoutUriFrom,
    showAddRedirectUriForm,
    processAddRedirectUriForm,
    showConfirmRedirectUriRemovalForm,
    processRemoveRedirectUriFrom,
    showEnterIdentityVerificationForm,
    processEnterIdentityVerificationForm,
    showChangeClientName,
    processChangeClientName,
    showChangeIdTokenAlgorithmForm,
    processChangeIdTokenAlgorithmForm,
    showMaxAgeEnabledForm,
    processMaxAgeEnabledForm,
    showChangePKCEEnforcedForm,
    processChangePKCEEnforcedForm,
    showChangeLandingPageUrlForm,
    processChangeLandingPageUrlForm
} from "../controllers/clients";
import validateKeySource from "../middleware/validate-public-key";
import validateUri from "../middleware/validators/uri-validator";

const router = Router();
export default router;

// TODO This should have the param /:clientId but at the moment we're abusing the fact that each service only has one client
router.get("/", showClient);

// TODO This shouldn't use the clientId - public beta is per service
router.route("/:clientId/:selfServiceClientId/go-live").get(showGoLivePage);

// TODO This shouldn't use the clientId - we're changing the service name
router.route("/:clientId/:selfServiceClientId/change-service-name").get(showChangeServiceNameForm).post(processChangeServiceNameForm);

router
    .route("/:clientId/:selfServiceClientId/change-public-key")
    .get(showChangePublicKeyForm)
    .post(validateKeySource, processChangePublicKeyForm);

router.route("/:clientId/:selfServiceClientId/change-redirect-uris").get(showChangeRedirectUrlsForm);

router
    .route("/:clientId/:selfServiceClientId/add-redirect-uri")
    .get(showAddRedirectUriForm)
    .post(validateUri("clients/add-redirect-uri.njk", "redirectUri"), processAddRedirectUriForm);

router
    .route("/:clientId/:selfServiceClientId/confirm-redirect-uri-removal")
    .get(showConfirmRedirectUriRemovalForm)
    .post(processRemoveRedirectUriFrom);

router.route("/:clientId/:selfServiceClientId/change-post-logout-uris").get(showChangePostLogoutUrisForm);

router.route("/:clientId/:selfServiceClientId/change-post-logout-uris").get(showChangePostLogoutUrisForm);

router.route("/:clientId/:selfServiceClientId/enter-contact").get(showEnterContactForm);

router
    .route("/:clientId/:selfServiceClientId/confirm-contact-removal")
    .get(showConfirmContactRemovalForm)
    .post(processConfirmContactRemovalForm);

router.route("/:clientId/:selfServiceClientId/enter-contact-email").get(showEnterContactEmailForm).post(processEnterContactEmailForm);

router.route("/:clientId/:selfServiceClientId/change-scopes").get(showChangeScopesForm).post(processChangeScopesForm);

router.route("/:clientId/:selfServiceClientId/change-claims").get(showChangeClaimsForm).post(processChangeClaimsForm);

router
    .route("/:clientId/:selfServiceClientId/add-post-logout-uri")
    .get(showAddPostLogoutUriForm)
    .post(validateUri("clients/add-post-logout-uri.njk", "postLogoutRedirectUri"), processAddPostLogoutUriForm);

router
    .route("/:clientId/:selfServiceClientId/confirm-post-logout-uri-removal")
    .get(showConfirmPostLogoutUriRemovalForm)
    .post(processRemovePostLogoutUriFrom);

router
    .route("/:clientId/:selfServiceClientId/change-back-channel-logout-uri")
    .get(showChangeBackChannelLogoutUriForm)
    .post(
        validateUri("clients/change-back-channel-logout-uri.njk", "backChannelLogoutUri", false, true),
        processChangeBackChannelLogOutUriForm
    );

router
    .route("/:clientId/:selfServiceClientId/change-sector-identifier-uri")
    .get(showChangeSectorIdentifierUriForm)
    .post(validateUri("clients/change-sector-identifier-uri.njk", "sectorIdentifierUri", false), processChangeSectorIdentifierUriForm);

router
    .route("/:clientId/:selfServiceClientId/enter-client-secret-hash")
    .get(showEnterClientSecretHashForm)
    .post(processEnterClientSecretHashForm);

router
    .route("/:clientId/:selfServiceClientId/enter-identity-verification")
    .get(showEnterIdentityVerificationForm)
    .post(processEnterIdentityVerificationForm);

router.route("/:clientId/:selfServiceClientId/change-client-name").get(showChangeClientName).post(processChangeClientName);

router
    .route("/:clientId/:selfServiceClientId/change-id-token-signing-algorithm")
    .get(showChangeIdTokenAlgorithmForm)
    .post(processChangeIdTokenAlgorithmForm);

router.route("/:clientId/:selfServiceClientId/change-max-age-enabled").get(showMaxAgeEnabledForm).post(processMaxAgeEnabledForm);

router.route("/:clientId/:selfServiceClientId/change-pkce-enforced").get(showChangePKCEEnforcedForm).post(processChangePKCEEnforcedForm);

router
    .route("/:clientId/:selfServiceClientId/change-landing-page-url")
    .get(showChangeLandingPageUrlForm)
    .post(validateUri("clients/change-landing-page-url.njk", "landingPageUrl"), processChangeLandingPageUrlForm);
