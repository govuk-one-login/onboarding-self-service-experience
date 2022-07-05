import express, {Request, Response} from "express";
import {listServices} from "../controllers/manage-account";
import {checkAuthorisation} from "../middleware/authoriser";
import {showAddServiceForm, processAddServiceForm} from "../controllers/manage-account";
import {serviceNameValidator} from "../middleware/serviceNameValidator";
import {marshall, unmarshall} from "@aws-sdk/util-dynamodb";

const router = express.Router();
router.get('/account/list-services', checkAuthorisation, listServices);

router.get('/add-service-name', checkAuthorisation, showAddServiceForm);
router.post('/create-service-name-validation', checkAuthorisation, serviceNameValidator, processAddServiceForm);

router.get('/client-details/:serviceId', async (req, res) => {
    const lambdaFacade = req.app.get("lambdaFacade");
    const listOfClients = await lambdaFacade.listClients(req.params.serviceId, req.session?.authenticationResult?.AccessToken as string);
    const client = unmarshall(listOfClients.data.Items[0]);
    const selfServiceClientId = client.sk.substring("client#".length);
    const serviceId = req.params.serviceId;
    const authClientId = client.clientId;

    res.render("dashboard/client-details.njk", {
        serviceId: req.params.serviceId,
        publicKeyAndUrlsNotUpdatedByUser: true,
        updatedField: req.session.updatedField,
        clientName: client.data,
        serviceName: client.service_name,
        clientId: client.clientId,
        redirectUrls: arraysToString(client.redirect_uris),
        userAttributesRequired: arraysToString(client.scopes),
        userPublicKey: client.default_fields.includes("public_key") ? "" : client.public_key,
        postLogoutRedirectUrls: arraysToString(client.post_logout_redirect_uris),
        urls: {
            changeClientName: `/change-client-name/${serviceId}/${selfServiceClientId}/${authClientId}?clientName=${encodeURI(client.data)}`,
            changeRedirectUris: `/change-redirect-URIs/${serviceId}/${selfServiceClientId}/${authClientId}?redirectUris=${encodeURI(arraysToString(client.redirect_uris))}`,
            changeUserAttributes: `/change-user-attributes/${serviceId}/${selfServiceClientId}/${authClientId}?userAttributes=${encodeURI(arraysToString(client.scopes))}`,
            changePublicKey: `/change-public-key/${serviceId}/${selfServiceClientId}/${authClientId}?publicKey=${encodeURI(client.clientId)}`,
            changePostLogoutUris: `/change-post-logout-URIs/${serviceId}/${selfServiceClientId}/${authClientId}?redirectUris=${encodeURI(arraysToString(client.post_logout_redirect_uris))}`,
        }
    });

    req.session.updatedField = "";

});

function arraysToString(array: string[]): string {
    return array.reduce((output, value) => { return output === "" ? output + value : output + " " + value })
}


export default router;
