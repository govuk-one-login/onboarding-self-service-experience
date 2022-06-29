import express, {Request, Response} from 'express';

const router = express.Router();

// Testing routes for Change your client name page
router.get('/change-client-name/:clientId', (req, res) => {
    res.render("dashboard/change-client-name.njk", {
        value: 'My juggling service',
        clientId: req.params.clientId
    });
});

router.post('/change-client-name/:clientId', (req, res) => {
    let clientName = req.body.clientName;
    if (clientName === "") {
        const errorMessages = new Map<string, string>();
        errorMessages.set('clientName', 'Enter your client name');
        res.render('dashboard/change-client-name.njk', {errorMessages: errorMessages, clientId: req.params.clientId});
        return;
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
