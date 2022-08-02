import express, {Request, Response} from "express";
import {changePassword, listServices, showChangePasswordForm} from "../controllers/manage-account";
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
        redirectUrls: client.redirect_uris.join(" "),
        userAttributesRequired: client.scopes.join(", "),
        userPublicKey: client.public_key == DEFAULT_PUBLIC_KEY ? "" : client.public_key,
        postLogoutRedirectUrls: client.post_logout_redirect_uris.join(" "),
        urls: {
            changeClientName: `/change-client-name/${serviceId}/${selfServiceClientId}/${authClientId}?clientName=${encodeURI(client.data)}`,
            changeRedirectUris: `/change-redirect-URIs/${serviceId}/${selfServiceClientId}/${authClientId}?redirectUris=${encodeURI(client.redirect_uris.join(" "))}`,
            changeUserAttributes: `/change-user-attributes/${serviceId}/${selfServiceClientId}/${authClientId}?userAttributes=${encodeURI(client.scopes.join(" "))}`,
            changePublicKey: `/change-public-key/${serviceId}/${selfServiceClientId}/${authClientId}?publicKey=${encodeURI(client.clientId)}`,
            changePostLogoutUris: `/change-post-logout-URIs/${serviceId}/${selfServiceClientId}/${authClientId}?redirectUris=${encodeURI(client.post_logout_redirect_uris.join(" "))}`,
        }
    });
    req.session.updatedField = undefined;
});

router.get('/change-password', showChangePasswordForm);


router.post('/change-password', changePassword);


const DEFAULT_PUBLIC_KEY = 'MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEAp2mLkQGo24Kz1rut0oZlviMkGomlQCH+iT1pFvegZFXq39NPjRWyatmXp/XIUPqCq9Kk8/+tq4Sgjw+EM5tATJ06j5r+35of58ATGVPniW//IhGizrv6/ebGcGEUJ0Y/ZmlCHYPV+lbewpttQ/IYKM1nr3k/Rl6qepbVYe+MpGubluQvdhgUYel9OzxiOvUk7XI0axPquiXzoEgmNNOai8+WhYTkBqE3/OucAv+XwXdnx4XHmKzMwTv93dYMpUmvTxWcSeEJ/4/SrbiK4PyHWVKU2BozfSUejVNhahAzZeyyDwhYJmhBaZi/3eOOlqGXj9UdkOXbl3vcwBH8wD30O9/4F5ERLKxzOaMnKZ+RpnygWF0qFhf+UeFMy+O06sdgiaFnXaSCsIy/SohspkKiLjNnhvrDNmPLMQbQKQlJdcp6zUzI7Gzys7luEmOxyMpA32lDBQcjL7KNwM15s4ytfrJ46XEPZUXESce2gj6NazcPPsrTa/Q2+oLS9GWupGh7AgMBAAE=';

export default router;
