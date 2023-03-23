import express from "express";
import {
    listServices,
    processChangeServiceNameForm,
    processPrivateBetaForm,
    showClient,
    showPrivateBetaForm,
    showPrivateBetaFormSubmitted
} from "../controllers/services";
import {checkAuthorisation} from "../middleware/authoriser";

export const router = express.Router();
export default router;

router.use(checkAuthorisation);

router.get("/", listServices);

// TODO This should have params :serviceId/:clientId but at the moment we're abusing the fact that each service only has one client
router.get("/:serviceId/clients", showClient);

router.route("/:serviceId/clients/:clientId/:selfServiceClientId/private-beta").get(showPrivateBetaForm).post(processPrivateBetaForm);

router.get("/:serviceId/clients/:clientId/:selfServiceClientId/private-beta/submitted", showPrivateBetaFormSubmitted);

router
    .route("/:serviceId/clients/:clientId/:selfServiceClientId/change-service-name")
    .get((req, res) => {
        res.render("account/change-service-name.njk", {
            serviceId: req.params.serviceId,
            values: {
                serviceName: req.query.serviceName
            }
        });
    })
    .post(processChangeServiceNameForm);
