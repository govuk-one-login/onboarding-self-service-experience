import express, {Request, Response} from "express";
import {listServices} from "../controllers/manage-account";
import {checkAuthorisation} from "../middleware/authoriser";
import {showAddServiceForm, processAddServiceForm} from "../controllers/manage-account";
import {serviceNameValidator} from "../middleware/serviceNameValidator";
import {marshall, unmarshall} from "@aws-sdk/util-dynamodb";
import session from "express-session";

const router = express.Router();
router.get('/account/list-services', checkAuthorisation, listServices);

router.get('/add-service-name', checkAuthorisation, showAddServiceForm);
router.post('/create-service-name-validation', checkAuthorisation, serviceNameValidator, processAddServiceForm);

router.get('/client-details/:serviceId', async (req, res) => {
    const lambdaFacade = req.app.get("lambdaFacade");
    console.log("Service ID: " + req.params.serviceId);
    const listOfClients = await lambdaFacade.listClients(req.params.serviceId, req.session?.authenticationResult?.AccessToken as string);
    const client = unmarshall(listOfClients.data.Items[0]);
    console.log(client);

    req.session.clientName = client.data,
    req.session.clientId = client.clientId;
    req.session.serviceName = client.service_name;
    req.session.redirectUrls    = client.client.redirect_uris[0];
    req.session.userAttributesRequired = client.scopes[0];
    req.session.userPublicKey = client.default_fields.includes("public_key") ? "" : client.public_key;
    req.session.postLogoutRedirectUrls = client.post_logout_redirect_uris[0];
    req.session.changeClientName = `/change-client-name/${client.clientId}`,
    req.session.changeRedirectUris = `/change-redirect-uris/${client.clientId}`,
    req.session.changeUserAttributes = `/change-user-attributes/${client.clientId}`,
    req.session.changePublicKey = `/change-public-key/${client.clientId}`,
    req.session.changePostLogoutUris = `/change-post-logout-urris/${client.clientId}`;
    
    res.render("dashboard/client-details.njk", {
        serviceId: req.params.serviceId,
        publicKeyAndUrlsNotUpdatedByUser: true,
        userDetailsUpdated: false,
        clientName: req.session.clientName,
        serviceName: req.session.serviceName,
        clientId: req.session.clientId,
        redirectUrls: req.session.redirectUrls,
        userAttributesRequired: req.session.userAttributesRequired,
        userPublicKey: req.session.userPublicKey,
        postLogoutRedirectUrls: req.session.postLogoutRedirectUrls,
        urls: {
            changeClientName: req.session.changeClientName,
            changeRedirectUris: req.session.changeRedirectUris,
            changeUserAttributes: req.session.changeUserAttributes,
            changePublicKey: req.session.changePublicKey,
            changePostLogoutUris: req.session.changePostLogoutUris,
        }

    })
});

export default router;
