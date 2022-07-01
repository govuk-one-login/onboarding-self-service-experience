import express, {Request, Response} from 'express';
import LambdaFacadeInterface from "../lib/lambda-facade/LambdaFacadeInterface";
import {marshall, unmarshall} from "@aws-sdk/util-dynamodb";

const router = express.Router();

// a function call clientDetailsRedirect

async function clientDetailsRedirect(req: Request , res: Response, updatedField: string ) {
    res.render("dashboard/client-details.njk", {
        updatedField: updatedField,
        serviceId: req.params.serviceId,
        publicKeyAndUrlsNotUpdatedByUser: true,
        userDetailsUpdated: true,
        clientName: req.session.clientName,
        serviceName: req.session.serviceName,
        clientId: req.session.clientId ,
        redirectUrls: req.session.redirectUrls,
        userAttributesRequired: req.session.userAttributesRequired,
        userPublicKey: req.session.userPublicKey,
        postLogoutRedirectUrls: req.session.postLogoutRedirectUrls,
        urls: {
            changeClientName: req.session.urls?.changeClientName,
            changeRedirectUris: req.session.urls?.changeRedirectUris,
            changeUserAttributes: req.session.urls?.changeUserAttributes,
            changePublicKey: req.session.urls?.changePublicKey,
            changePostLogoutUris: req.session.urls?.changePostLogoutUris,
        }
    })
}

// Testing routes for Change your client name page
router.get('/change-client-name/:clientId', (req, res) => {
    res.render("dashboard/change-client-name.njk", {
        value: req.session.clientName,
        clientId: req.params.clientId
    });
});

router.post('/change-client-name/:clientId', async (req, res) => {
    let clientName = req.body.clientName;
    if (clientName === "") {
        const errorMessages = new Map<string, string>();
        errorMessages.set('clientName', 'Enter your client name');
        res.render('dashboard/change-client-name.njk', {errorMessages: errorMessages, clientId: req.params.clientId});
        return;
    }
    const facade: LambdaFacadeInterface = req.app.get("lambdaFacade");
    let result;
    try {
        result = await facade.updateClient(req.params.clientId, {client_name: clientName}, req.session.authenticationResult?.AccessToken as string);
    } catch (error) {
        console.log(error)
    }
    console.log("RESULT ".repeat(5))
    console.log(result)
    if( result?.status === 200) {
        req.session.clientName = clientName;
        clientDetailsRedirect(req, res, "Client name");
    }
    res.redirect(`/client-details/${req.params.clientId}`);
});

// Testing routes for Change your redirect URIs page
router.get('/change-redirect-URIs/:clientId', (req, res) => {
    res.render("dashboard/change-redirect-URIs.njk", {
        value: 'https://get-a-juggling-licence.gov.uk/redirect/endpoint', clientId: req.params.clientId
    });
});

router.post('/change-redirect-URIs/:clientId', (req, res) => {
    let clientName = req.body.redirectURIs;
    if (clientName === "") {
        const errorMessages = new Map<string, string>();
        errorMessages.set('redirectURIs', 'Enter your redirect URIs');
        res.render('dashboard/change-redirect-URIs.njk', {errorMessages: errorMessages, clientId: req.params.clientId});
        return;
    }
    res.redirect(`/client-details/${req.params.clientId}`);
});


// Testing routes for Change user attributes page
router.get('/change-user-attributes/:clientId', (req, res) => {
    res.render("dashboard/change-user-attributes.njk", {clientId: req.params.clientId});
});

router.post('/change-user-attributes/:clientId', (req, res) => {
    res.redirect(`/client-details/${req.params.clientId}`);
});

// Testing routes for Change your post logout redirect URIs page
router.get('/change-post-logout-URIs/:clientId', (req, res) => {
    res.render("dashboard/change-post-logout-URIs.njk", {
        value: 'https://get-a-juggling-licence.gov.uk/redirect/endpoint',
        clientId: req.params.clientId
    });
});

router.post('/change-post-logout-URIs/:clientId', (req, res) => {
    let clientName = req.body.postLogoutURIs;
    if (clientName === "") {
        const errorMessages = new Map<string, string>();
        errorMessages.set('postLogoutURIs', 'Enter your post logout redirect URIs');
        res.render('dashboard/change-post-logout-URIs.njk', {errorMessages: errorMessages, clientId: req.params.clientId});
        return;
    }
    res.redirect(`/client-details/${req.params.clientId}`);
});

// Testing routes for Change your public key page
router.get('/change-public-key/:clientId', (req, res) => {
    res.render("dashboard/change-public-key.njk", {
        value: 'public key test value',
        clientId: req.params.clientId
    });
});

router.post('/change-public-key/:clientId', (req, res) => {
    let clientName = req.body.serviceUserPublicKey;
    if (clientName === "") {
        const errorMessages = new Map<string, string>();
        errorMessages.set('serviceUserPublicKey', 'Paste in or upload a public key');
        res.render('dashboard/change-public-key.njk', {errorMessages: errorMessages, clientId: req.params.clientId});
        return;
    }
    res.redirect(`/client-details/${req.params.clientId}`);
});

export default router;
