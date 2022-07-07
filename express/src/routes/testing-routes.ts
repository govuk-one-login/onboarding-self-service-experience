import express, {Request, Response , NextFunction} from 'express';
import LambdaFacadeInterface from "../lib/lambda-facade/LambdaFacadeInterface";
import { uriValidator } from "../middleware/urlValidator"
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
    try {
        await facade.updateClient(req.params.serviceId, req.params.selfServiceClientId, req.params.clientId, {data: clientName}, req.session.authenticationResult?.AccessToken as string);
    } catch (error) {
        console.log(error)
        res.redirect('/there-is-a-problem');
        return;
    }
    req.session.updatedField = "client name";
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

    const redirectUris = req.body.redirectURIs.split(" ");
    if(!uriValidator(redirectUris , req , res  )){
        const errorMessages = new Map<string, string>();
        errorMessages.set('postLogoutURIs', 'Enter your redirect URIs in the format https://example.com');
        return res.render('dashboard/change-redirect-URIs.njk', {
            errorMessages: errorMessages,
            value: redirectUris.toString().replaceAll(",", " "),
            serviceId: req.params.serviceId,
            selfServiceClientId: req.params.selfServiceClientId,
            clientId: req.params.clientId
        });
    }

    const facade: LambdaFacadeInterface = req.app.get("lambdaFacade");
    try {
        await facade.updateClient(req.params.serviceId, req.params.selfServiceClientId, req.params.clientId, {redirect_uris: redirectUris}, req.session.authenticationResult?.AccessToken as string);
    } catch (error) {
        console.log(error)
        return res.redirect('/there-is-a-problem');
    }
    
    req.session.updatedField = "redirect uris";
    return res.redirect(`/client-details/${req.params.serviceId}`);
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
        errorMessages.set('serviceUserPublicKey', 'Paste in a public key');
        res.render('dashboard/change-public-key.njk', {errorMessages: errorMessages, clientId: req.params.clientId});
        return;
    }
    res.redirect(`/client-details/${req.params.serviceId}`);
});

export default router;
