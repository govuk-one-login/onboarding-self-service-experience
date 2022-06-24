import express, {Request, Response} from "express";
import {listServices} from "../controllers/manage-account";
import {checkAuthorisation} from "../middleware/authoriser";
import {showAddServiceForm, processAddServiceForm} from "../controllers/manage-account";
import {serviceNameValidator} from "../middleware/serviceNameValidator";

const router = express.Router();
router.get('/account/list-services', checkAuthorisation, listServices);

router.get('/add-service-name', checkAuthorisation, showAddServiceForm);
router.post('/create-service-name-validation', checkAuthorisation, serviceNameValidator, processAddServiceForm);

router.get('/client-details/:serviceId', (req, res) => {
    res.render("dashboard/client-details.njk", {
        publicKeyAndUrlsNotUpdatedByUser: true,
        userDetailsUpdated: false,
        clientName: "My juggling service",
        serviceName: "My juggling service",
        clientId: "X8rnOEw0SqOdEAOnWyPQ6YsJugQ",
        redirectUrls: "https://get-a-juggling-licence.gov.uk/redirect/endpoint",
        userAttributesRequired: "Email address<br>Phone number",
        userPublicKey: "Not yet added",
        postLogoutRedirectUrls: "Not yet added"
    });
});

export default router;
