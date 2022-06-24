import express, {Request, Response} from 'express';

const router = express.Router();

// Testing routes for Change your client name page
router.get('/change-client-name', (req, res) => {
    res.render("dashboard/change-client-name.njk", {
        value: 'My juggling service'
    });
});

router.post('/change-client-name', (req, res) => {
    let clientName = req.body.clientName;
    if (clientName === "") {
        const errorMessages = new Map<string, string>();
        errorMessages.set('clientName', 'Enter your client name');
        res.render('dashboard/change-client-name.njk', {errorMessages: errorMessages});
        return;
    }
    res.redirect('/client-details');
});

// Testing routes for Change your redirect URIs page
router.get('/change-redirect-URIs', (req, res) => {
    res.render("dashboard/change-redirect-URIs.njk", {
        value: 'https://get-a-juggling-licence.gov.uk/redirect/endpoint'
    });
});

router.post('/change-redirect-URIs', (req, res) => {
    let clientName = req.body.redirectURIs;
    if (clientName === "") {
        const errorMessages = new Map<string, string>();
        errorMessages.set('redirectURIs', 'Enter your redirect URIs');
        res.render('dashboard/change-redirect-URIs.njk', {errorMessages: errorMessages});
        return;
    }
    res.redirect('/client-details');
});


// Testing routes for Change user attributes page
router.get('/change-user-attributes', (req, res) => {
    res.render("dashboard/change-user-attributes.njk");
});

router.post('/change-user-attributes', (req, res) => {
    res.redirect('/client-details');
});



export default router;
