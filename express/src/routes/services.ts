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

router.get("/services", checkAuthorisation, listServices);

// TODO This should have params :serviceId/:clientId but at the moment we're abusing the fact that each service only has one client
router.get("/services/:serviceId/client", checkAuthorisation, showClient);

router.get("/service/:serviceId/client/:clientId/:selfServiceClientId/private-beta", checkAuthorisation, showPrivateBetaForm);
router.post("/service/:serviceId/client/:clientId/:selfServiceClientId/private-beta", checkAuthorisation, processPrivateBetaForm);

router.get(
    "/service/:serviceId/client/:clientId/:selfServiceClientId/private-beta/submitted",
    checkAuthorisation,
    showPrivateBetaFormSubmitted
);

router.get("/service/:serviceId/client/:clientId/:selfServiceClientId/change-service-name", checkAuthorisation, (req, res) => {
    res.render("account/change-service-name.njk", {
        serviceId: req.params.serviceId,
        values: {
            serviceName: req.query.serviceName
        }
    });
});

router.post(
    "/service/:serviceId/client/:clientId/:selfServiceClientId/change-service-name",
    checkAuthorisation,
    processChangeServiceNameForm
);

export default router;
