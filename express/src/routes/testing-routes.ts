import express, {Request, Response} from 'express';
import LambdaFacadeInterface from "../lib/lambda-facade/LambdaFacadeInterface";
import {urisValidator} from "../middleware/urisValidator";

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

router.post('/change-redirect-URIs/:serviceId/:selfServiceClientId/:clientId', urisValidator("dashboard/change-redirect-URIs.njk", "redirectURIs"), async (req, res) => {
    const redirectUris = req.body.redirectURIs.split(" ").filter((url: string) => url !== "");

    const facade: LambdaFacadeInterface = req.app.get("lambdaFacade");
    let result;
    try {
        result = await facade.updateClient(req.params.serviceId, req.params.selfServiceClientId, req.params.clientId, {redirect_uris: redirectUris}, req.session.authenticationResult?.AccessToken as string);
    } catch (error) {
        console.log(error)
        res.redirect('/there-is-a-problem');
        return;
    }
    req.session.updatedField = "redirect URLs";
    res.redirect(`/client-details/${req.params.serviceId}`);
});


// Testing routes for Change user attributes page
router.get('/change-user-attributes/:serviceId/:selfServiceClientId/:clientId', (req, res) => {
    const userAttributes = (req.query?.userAttributes as string).split(" ");
    const email: boolean = userAttributes.includes("email");
    const phone: boolean = userAttributes.includes("phone");
    const offline_access: boolean = userAttributes.includes("offline_access");

    res.render("dashboard/change-user-attributes.njk", {
        email: email,
        phone: phone,
        offline_access: offline_access,
        serviceId: req.params.serviceId,
        selfServiceClientId: req.params.selfServiceClientId,
        clientId: req.params.clientId
    });
});

router.post('/change-user-attributes/:serviceId/:selfServiceClientId/:clientId', async (req, res) => {
    const facade: LambdaFacadeInterface = req.app.get("lambdaFacade");
    const attributes: string[] = ["openid"];

    if(Array.isArray(req.body.userAttributes)) {
        attributes.push( ...req.body.userAttributes );
    } else if( typeof req.body.userAttributes === "string" ) {
        attributes.push( req.body.userAttributes );
    }

    console.log(attributes)
    try {
        await facade.updateClient(req.params.serviceId, req.params.selfServiceClientId, req.params.clientId, {scopes: attributes}, req.session.authenticationResult?.AccessToken as string);
    } catch (error) {
        console.log(error)
        res.redirect('/there-is-a-problem');
        return;
    }
    req.session.updatedField = "required user attributes";
    res.redirect(`/client-details/${req.params.serviceId}`);
});

// Testing routes for Change your post logout redirect URIs page
router.get('/change-post-logout-URIs/:serviceId/:selfServiceClientId/:clientId', (req, res) => {
    res.render("dashboard/change-post-logout-URIs.njk", {
        value: req.query?.redirectUris, // this is not clientName
        serviceId: req.params.serviceId,
        selfServiceClientId: req.params.selfServiceClientId,
        clientId: req.params.clientId
    });
});

router.post('/change-post-logout-URIs/:serviceId/:selfServiceClientId/:clientId', urisValidator("dashboard/change-post-logout-URIs.njk", "postLogoutURIs"), async (req, res) => {
    let postLogoutURIs = req.body.postLogoutURIs.split(" ").filter((url: string) => url !== "");
    const facade: LambdaFacadeInterface = req.app.get("lambdaFacade");
    try {
        await facade.updateClient(req.params.serviceId, req.params.selfServiceClientId, req.params.clientId, {post_logout_redirect_uris: postLogoutURIs}, req.session.authenticationResult?.AccessToken as string);
    } catch (error) {
        console.log(error)
        res.redirect('/there-is-a-problem');
        return;
    }
    req.session.updatedField = "post-logout redirect URLs";
    res.redirect(`/client-details/${req.params.serviceId}`);
});

// Testing routes for Change your public key page
router.get('/change-public-key/:serviceId/:selfServiceClientId/:clientId', (req, res) => {
    res.render("dashboard/change-public-key.njk", {
        value: '', // this is not clientName
        serviceId: req.params.serviceId,
        selfServiceClientId: req.params.selfServiceClientId,
        clientId: req.params.clientId
    });
});

router.post('/change-public-key/:serviceId/:selfServiceClientId/:clientId', async (req, res) => {
    let publicKey = req.body.serviceUserPublicKey;
    if (publicKey === "") {
        const errorMessages = new Map<string, string>();
        errorMessages.set('serviceUserPublicKey', 'Paste in a public key');
        res.render('dashboard/change-public-key.njk', {errorMessages: errorMessages, clientId: req.params.clientId});
        return;
    }

    if (!publicKey.startsWith("-----BEGIN PUBLIC KEY-----") || !publicKey.endsWith("-----END PUBLIC KEY-----")) {
        const errorMessages = new Map<string, string>();
        errorMessages.set('serviceUserPublicKey', 'Enter a valid public key in PEM format, including the headers');
        res.render('dashboard/change-public-key.njk', {errorMessages: errorMessages, clientId: req.params.clientId});
        return;
    }

    if (publicKey.startsWith("-----BEGIN PUBLIC KEY-----") && publicKey.endsWith("-----END PUBLIC KEY-----")) {
        // remove the -----BEGIN PUBLIC KEY----- and -----END PUBLIC KEY-----
        publicKey = publicKey.substring(26, publicKey.length - 24);
    }

    const facade: LambdaFacadeInterface = req.app.get("lambdaFacade");
    try {
       await facade.updateClient(req.params.serviceId, req.params.selfServiceClientId, req.params.clientId, {public_key: publicKey}, req.session.authenticationResult?.AccessToken as string);
    } catch (error) {
        console.log(error)
        res.redirect('/there-is-a-problem');
        return;
    }
    req.session.updatedField = "public key";
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
