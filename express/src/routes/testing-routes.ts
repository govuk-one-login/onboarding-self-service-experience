import express, {Request, Response} from 'express';

const router = express.Router();

//Testing route for service name get request

// Testing route for service name  get request with error
router.get('/add-service-name-error', (req, res) => {
  let errorMessages: Map<String, String> = new Map<String, String>();
  errorMessages.set('serviceName', 'Enter your service name');
  res.render("add-service-name.njk",{ errorMessages: errorMessages });
});

// Testing route for client details dashboard
router.get('/service-dashboard-client-details', (req, res) => {
  res.render("service-dashboard-client-details.njk", {
      publicKeyAndUrlsNotUpdatedByUser: true,
      userDetailsUpdated: false
  });
});

// Testing route for client details dashboard update view
router.get('/service-dashboard-client-details-update', (req, res) => {
  res.render("service-dashboard-client-details-update.njk");
});

// Testing route for client details dashboard update view with errors
router.get('/service-dashboard-client-details-update-error', (req, res) => {
  let errorMessages: Map<String, String> = new Map<String, String>();
  errorMessages.set('clientNameDetails', 'Enter a client name');
  errorMessages.set('redirectUrl', 'Enter a redirect URI');
  res.render("service-dashboard-client-details-update.njk",{ errors: errorMessages });
});

export default router;
