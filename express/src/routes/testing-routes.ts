import express, {Request, Response} from 'express';
import LambdaFacadeInterface from "../lib/lambda-facade/LambdaFacadeInterface";

const router = express.Router();

// Testing routes for Change your client name page
router.get('/change-client-name/:serviceId/:selfServiceClientId/:clientId', (req, res) => {
    res.render("dashboard/change-client-name.njk", {
        value: req.query?.clientName,
        serviceId: req.params.serviceId,
        selfServiceClientId: req.params.selfServiceClientId,
        clientId: req.params.clientId
    });
});

router.post('/change-client-name/:serviceId/:selfServiceClientId/:clientId', async (req, res) => {
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
        result = await facade.updateClient(req.params.serviceId, req.params.selfServiceClientId, req.params.clientId, {data: clientName}, req.session.authenticationResult?.AccessToken as string);
    } catch (error) {
        console.log(error)
        res.redirect('/there-is-a-problem');
        return;
    }
    res.redirect(`/client-details/${req.params.serviceId}`);
});

// Testing routes for Change your redirect URIs page
router.get('/change-redirect-URIs/:serviceId/:selfServiceClientId/:clientId', (req, res) => {
    res.render("dashboard/change-redirect-URIs.njk", {
        value: req.query?.redirectUris,
        serviceId: req.params.serviceId,
        selfServiceClientId: req.params.selfServiceClientId,
        clientId: req.params.clientId
    });
});

router.post('/change-redirect-URIs/:serviceId/:selfServiceClientId/:clientId', async (req, res) => {
    let redirectURIs = req.body.redirectURIs;
    if (redirectURIs === "") {
        const errorMessages = new Map<string, string>();
        errorMessages.set('redirectURIs', 'Enter your redirect URIs');
        res.render('dashboard/change-redirect-URIs.njk', {
            errorMessages: errorMessages,
            value: req.body.redirectURIs,
            serviceId: req.params.serviceId,
            selfServiceClientId: req.params.selfServiceClientId,
            clientId: req.params.clientId
        });
        return;
    }

    // further error handling around a valid array of valid URIs

    const redirectUris = req.body.redirectURIs.split(" ");

    const facade: LambdaFacadeInterface = req.app.get("lambdaFacade");
    let result;
    try {
        result = await facade.updateClient(req.params.serviceId, req.params.selfServiceClientId, req.params.clientId, {redirect_uris: redirectUris}, req.session.authenticationResult?.AccessToken as string);
    } catch (error) {
        console.log(error)
        res.redirect('/there-is-a-problem');
        return;
    }

    res.redirect(`/client-details/${req.params.serviceId}`);
});


// Testing routes for Change user attributes page
router.get('/change-user-attributes/:serviceId/:selfServiceClientId/:clientId', (req, res) => {
    res.render("dashboard/change-user-attributes.njk", {
        value: req.query?.clientName || 'My juggling service', // clientName is not the right thing for this
        serviceId: req.params.serviceId,
        selfServiceClientId: req.params.selfServiceClientId,
        clientId: req.params.clientId
    });
});

router.post('/change-user-attributes/:serviceId/:selfServiceClientId/:clientId', (req, res) => {
    res.redirect(`/client-details/${req.params.serviceId}`);
});

// Testing routes for Change your post logout redirect URIs page
router.get('/change-post-logout-URIs/:serviceId/:selfServiceClientId/:clientId', (req, res) => {
    res.render("dashboard/change-post-logout-URIs.njk", {
        value: req.query?.clientName || 'My juggling service', // this is not clientName
        serviceId: req.params.serviceId,
        selfServiceClientId: req.params.selfServiceClientId,
        clientId: req.params.clientId
    });
});

router.post('/change-post-logout-URIs/:serviceId/:selfServiceClientId/:clientId', (req, res) => {
    let clientName = req.body.postLogoutURIs;
    if (clientName === "") {
        const errorMessages = new Map<string, string>();
        errorMessages.set('postLogoutURIs', 'Enter your post logout redirect URIs');
        res.render('dashboard/change-post-logout-URIs.njk', {
            errorMessages: errorMessages,
            clientId: req.params.clientId
        });
        return;
    }
    res.redirect(`/client-details/${req.params.serviceId}`);
});

// Testing routes for Change your public key page
router.get('/change-public-key/:serviceId/:selfServiceClientId/:clientId', (req, res) => {
    res.render("dashboard/change-public-key.njk", {
        value: req.query?.clientName || 'My juggling service', // this is not clientName
        serviceId: req.params.serviceId,
        selfServiceClientId: req.params.selfServiceClientId,
        clientId: req.params.clientId
    });
});

router.post('/change-public-key/:serviceId/:selfServiceClientId/:clientId', (req, res) => {
    let clientName = req.body.serviceUserPublicKey;
    if (clientName === "") {
        const errorMessages = new Map<string, string>();
        errorMessages.set('serviceUserPublicKey', 'Paste in or upload a public key');
        res.render('dashboard/change-public-key.njk', {errorMessages: errorMessages, clientId: req.params.clientId});
        return;
    }
    res.redirect(`/client-details/${req.params.serviceId}`);
});

// Testing route for "Finish connecting the sign in journey to your service" page
router.get('/redirect-placeholder', (req, res) => {
    res.render("dashboard/finish-connecting-sign-in-journey.njk", {
        changeRedirectURIsUrl: "/change-redirect-URIs/:serviceId/:selfServiceClientId/:clientId",
        changePublicKeyUrl: "/change-public-key/:serviceId/:selfServiceClientId/:clientId"
    });
});

export default router;
