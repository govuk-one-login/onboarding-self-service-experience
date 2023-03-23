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

router.get("/:serviceId/clients/:clientId/:selfServiceClientId/private-beta", showPrivateBetaForm);
router.post("/:serviceId/clients/:clientId/:selfServiceClientId/private-beta", processPrivateBetaForm);

router.get("/:serviceId/clients/:clientId/:selfServiceClientId/private-beta/submitted", showPrivateBetaFormSubmitted);

router.get("/:serviceId/clients/:clientId/:selfServiceClientId/change-service-name", (req, res) => {
    res.render("account/change-service-name.njk", {
        serviceId: req.params.serviceId,
        values: {
            serviceName: req.query.serviceName
        }
    });
});

router.post("/:serviceId/clients/:clientId/:selfServiceClientId/change-service-name", processChangeServiceNameForm);
