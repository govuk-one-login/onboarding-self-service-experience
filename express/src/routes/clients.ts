import {Router} from "express";
import {
    processChangeServiceNameForm,
    processPrivateBetaForm,
    showClient,
    showPrivateBetaForm,
    showPrivateBetaFormSubmitted,
    showProcessChangeServiceNameForm
} from "../controllers/clients";

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
