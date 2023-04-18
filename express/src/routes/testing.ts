import {Router} from "express";
import {emailValidator} from "../middleware/validators/emailValidator";
import validateMobileNumber from "../middleware/validators/mobileValidator";
import {passwordValidator} from "../middleware/validators/passwordValidator";
import SelfServiceServicesService from "../services/self-service-services-service";

const router = Router();
export default router;

// Testing routes for Change your client name page
router.get("/services/:serviceId/clients/:clientId/:selfServiceClientId/change-client-name", (req, res) => {
    res.render("service-details/change-client-name.njk", {
        serviceId: req.params.serviceId,
        selfServiceClientId: req.params.selfServiceClientId,
        clientId: req.params.clientId,
        values: {
            clientName: req.query.clientName
        }
    });
});

router.post("/services/:serviceId/clients/:clientId/:selfServiceClientId/change-client-name", async (req, res) => {
    const newClientName = req.body.clientName;

    if (newClientName === "") {
        res.render("service-details/change-client-name.njk", {
            serviceId: req.params.serviceId,
            selfServiceClientId: req.params.selfServiceClientId,
            clientId: req.params.clientId,
            errorMessages: {
                clientName: "Enter your client name"
            }
        });

        return;
    }

    const s4: SelfServiceServicesService = req.app.get("backing-service");
    try {
        await s4.updateClient(
            req.params.serviceId,
            req.params.selfServiceClientId,
            req.params.clientId,
            {client_name: newClientName},
            req.session.authenticationResult?.AccessToken as string
        );
    } catch (error) {
        console.error(error);
        res.redirect("/there-is-a-problem");
        return;
    }

    req.session.updatedField = "client name";
    res.redirect(`/services/${req.params.serviceId}/clients}`);
});

// Testing route for "Finish connecting the sign in journey to your service" page
router.get("/redirect-placeholder", (req, res) => {
    res.render("service-details/finish-connecting-sign-in-journey.njk", {
        changeRedirectUrisUrl: "/services/:serviceId/clients/:clientId/:selfServiceClientId/change-redirect-uris",
        changePublicKeyUrl: "/services/:serviceId/clients/:clientId/:selfServiceClientId/change-public-key"
    });
});

////
// Testing routes for Change your public key page version 2
////

//// Testing route without public key - "First time change"
router.get("/change-public-key-v2", (req, res) => {
    res.render("service-details/change-public-key-v2.njk", {
        serviceId: "mockedServiceId",
        selfServiceClientId: "mockedSelfServiceClientId",
        clientId: "mockedClientId",
        serviceName: "My juggling service"
    });
});

//// Testing route with public key - "Returning change"
router.get("/change-public-key-v2-returning", (req, res) => {
    res.render("service-details/change-public-key-v2.njk", {
        serviceId: "mockedServiceId",
        selfServiceClientId: "mockedSelfServiceClientId",
        clientId: "mockedClientId",
        serviceName: "My juggling service",
        currentPublicKey:
            "gkqhkiG9w0BAQEFBBCCCQ8AMIIBCgKCAQEAozeSawLorZgEDia67XkRn61xmh/NyaI+lXxEDpip713csnGBWPGRdePw7/a/nGoLbOFC37rmEA05e7pKaklLTuceDaeTe/KPDorZcdnn8HO8HBVe8bgpsuNnf6QpWERPKHn78WNeA50apBkkB2GafqFn7tVr4HxwTwCaPuAtBhb+MBWz02OzA1g4XBPApXS+CZs7j3aUpSOYBUMshIAbQAlqwp+TfXDnnBS73w+IrbOhWhnPnZ7zVz8QqKt00FAqhvUInDQQFpNS9a0O2aHND2X3Nw7717yZdthjXWiMTj5DSJF4kd6QD6WITUqqhmarhO1qyM9uxKr7W9mteU+7wIDAQABMIIBIjANB"
    });
});

//// Testing post route to test error messages
router.post("/change-public-key-v2", async (req, res) => {
    const serviceUserPublicKey = req.body.serviceUserPublicKey;
    const serviceUserPublicKeyText = req.body.serviceUserPublicKeyText;
    const serviceUserPublicKeyFile = req.body.serviceUserPublicKeyFile;

    if (serviceUserPublicKey === "text" && serviceUserPublicKeyText === "") {
        res.render("service-details/change-public-key-v2.njk", {
            serviceId: "mockedServiceId",
            selfServiceClientId: "mockedSelfServiceClientId",
            clientId: "mockedClientId",
            serviceName: "My juggling service",
            serviceUserPublicKey: "text",
            errorMessages: {
                serviceUserPublicKeyText: "Enter a public key"
            }
        });

        return;
    }

    if (serviceUserPublicKey === "file" && serviceUserPublicKeyFile === "") {
        res.render("service-details/change-public-key-v2.njk", {
            serviceId: "mockedServiceId",
            selfServiceClientId: "mockedSelfServiceClientId",
            clientId: "mockedClientId",
            serviceName: "My juggling service",
            serviceUserPublicKey: "file".trim(),
            errorMessages: {
                serviceUserPublicKeyFile: "Upload a file"
            }
        });

        return;
    }

    if (serviceUserPublicKeyText === "" && serviceUserPublicKeyFile === "") {
        res.render("service-details/change-public-key-v2.njk", {
            serviceId: "mockedServiceId",
            selfServiceClientId: "mockedSelfServiceClientId",
            clientId: "mockedClientId",
            serviceName: "My juggling service",
            errorMessages: {
                "serviceUserPublicKey-options": "Choose how to change your public key"
            }
        });

        return;
    }

    res.redirect("/client-details-mocked");
});

//// Testing route to redirect to client details
router.get("/client-details-mocked", (req, res) => {
    res.render("service-details/client-details.njk", {
        serviceName: "My juggling service"
    });
});

// Testing routes for Change your email address page
router.get("/change-email-address", (req, res) => {
    res.render("account/change-email-address.njk", {
        values: {
            emailAddress: "your.email@digital.cabinet-office.gov.uk"
        }
    });
});

router.post("/change-email-address", emailValidator("account/change-email-address.njk"), async (req, res) => {
    res.redirect("/account");
});

// Testing routes for Check your email address page
// The url needs to be updated when implementing functionality
router.get("/check-email-visual-test", (req, res) => {
    res.render("account/check-email.njk", {
        values: {
            emailAddress: "email@address.com"
        }
    });
});

router.post("/check-email-visual-test", async (req, res) => {
    if (req.body.securityCode === "") {
        res.render("account/check-email.njk", {
            errorMessages: {
                securityCode: "Your code should be 6 characters long"
            }
        });

        return;
    }

    res.redirect("/account");
});

//// Testing route to redirect to account page success screen
router.get("/account-success-screen-test", (req, res) => {
    res.render("account/account.njk", {
        emailAddress: "your.email@digital.cabinet-office.gov.uk",
        mobilePhoneNumber: "07123456789",
        passwordLastChanged: "Last changed 1 month ago",
        updatedField: "email address"
    });
});

// Testing route for testing when the private beta request has already been submitted.
router.get("/private-beta-submitted", (req, res) => {
    res.render("service-details/private-beta.njk", {
        privateBetaRequestSubmitted: true,
        dateRequestSubmitted: "10 May 2022",
        serviceName: "My juggling license"
    });
});

// Testing route for 'Problem with the service' page
router.get("/there-is-a-problem-test", (req, res) => {
    res.render("there-is-a-problem.njk");
});

// Testing routs for 'We need to do security checks' page
router.get("/security-check-change-number", (req, res) => {
    res.render("security-check-change-number.njk", {
        values: {
            emailAddress: "your.email@digital.cabinet-office.gov.uk"
        }
    });
});

router.post("/security-check-change-number", async (req, res) => {
    if (req.body.securityCode === "") {
        res.render("security-check-change-number.njk", {
            values: {
                emailAddress: "your.email@digital.cabinet-office.gov.uk"
            },
            errorMessages: {
                securityCode: "Enter the security code"
            }
        });

        return;
    }

    res.redirect("/test/confirm-phone-number");
});

// Testing routes for 'Confirm the phone number' page
router.get("/confirm-phone-number", (req, res) => {
    res.render("confirm-phone-number.njk");
});

// TODO this validates the string but it needs to check the given number matches what's in Cognito
router.post("/confirm-phone-number", validateMobileNumber("confirm-phone-number.njk"), async (req, res) => {
    res.redirect("/test/new-phone-number");
});

// Testing routes for 'You’ve changed the phone number linked to your account' page
router.get("/phone-number-changed", (req, res) => {
    res.render("phone-number-changed.njk");
});

router.post("/phone-number-changed", async (req, res) => {
    res.redirect("/client-details-mocked");
});

// Testing routes for 'Confirm the phone number' page
router.get("/new-phone-number", (req, res) => {
    res.render("new-phone-number.njk");
});

router.post("/new-phone-number", validateMobileNumber("new-phone-number.njk"), async (req, res) => {
    res.render("common/check-mobile.njk");
});

// Testing routes for 'An account already exist' page
router.get("/account-exists", (req, res) => {
    res.render("create-account/account-exists.njk", {
        values: {
            emailAddress: "email@address.com"
        }
    });
});

router.post("/account-exists", passwordValidator("create-account/account-exists.njk"), async (req, res) => {
    res.render("common/check-mobile.njk");
});

//// Testing routes for 'You entered the wrong mobile security code too many times' page
//// The code below is for frontend/visual testing purposes only

router.get("/wrong-text-code", (req, res) => {
    res.render("wrong-otp-too-many-times.njk", {
        pageTitle: "Wrong text message code entered too many times"
    });
});

// When implementing the backend, depending on journey we should request new code and after that redirect (/create/enter-mobile or /sign-in/enter-text-code) or render the appropriate template - depending on implementation
router.post("/wrong-text-code", async (req, res) => {
    res.render("common/check-mobile.njk");
});

//// Testing routes for 'You entered the wrong email security code too many times' page
router.get("/wrong-email-code", (req, res) => {
    res.render("wrong-otp-too-many-times.njk", {
        pageTitle: "Wrong email code entered too many times"
    });
});

// When implementing the backend, depending on journey we should request new code and after that redirect or render the appropriate template - depending on implementation
router.post("/wrong-email-code", async (req, res) => {
    res.render("account/check-email.njk");
});

router.get("/resend-email-code", async (req, res) => {
    res.render("common/resend-security-code.njk", {
        securityCodeMethod: "email"
    });
});

router.post("/resend-email-code", async (req, res) => {
    res.redirect("/security-check-change-number");
});

// Testing route for 'Team members' page
router.get("/team-members/:serviceId/:selfServiceClientId/:clientId", (req, res) => {
    res.render("service-details/team-members.njk", {
        serviceId: req.params.serviceId,
        selfServiceClientId: req.params.selfServiceClientId,
        clientId: req.params.clientId,
        serviceName: req.session.serviceName,
        users: [
            {
                userPersonalName: "Courtney Toth",
                isCurrentUser: true,
                userEmail: "courtney.toth@gov.uk.cabinet-office.gov.uk",
                permissions: {
                    "Manage team members": true,
                    "Change integration client details": true,
                    "Change service name": true,
                    "Request to join private beta": true
                }
            },
            {
                userPersonalName: "Beth Walton",
                isCurrentUser: false,
                userEmail: "beth.walton@gov.cabinet-office.gov.uk",
                permissions: {
                    "Manage team members": true,
                    "Change integration client details": false,
                    "Change service name": false,
                    "Request to join private beta": true
                }
            },
            {
                userPersonalName: "Onyebuchi Hathway",
                isCurrentUser: false,
                userEmail: "onyebuchi.hathwayk@gov.cabinet-office.gov.uk",
                permissions: {
                    "Manage team members": false,
                    "Change integration client details": true,
                    "Change service name": true,
                    "Request to join private beta": false
                }
            },
            {
                userPersonalName: "Robin Jöllenbeck",
                isCurrentUser: false,
                userEmail: "robin.jöllenbeck@gov.cabinet-office.gov.uk",
                permissions: {
                    "Manage team members": false,
                    "Change integration client details": true,
                    "Change service name": true,
                    "Request to join private beta": false
                }
            },
            {
                userPersonalName: "Wallace Martinez",
                isCurrentUser: false,
                userEmail: "wallace.martinez@gov.cabinet-office.gov.uk",
                permissions: {
                    "Manage team members": false,
                    "Change integration client details": false,
                    "Change service name": false,
                    "Request to join private beta": false
                }
            },
            {
                userPersonalName: "Zawadi Cameron",
                isCurrentUser: false,
                userEmail: "zawadi.cameron@gov.cabinet-office.gov.uk",
                permissions: {
                    "Manage team members": false,
                    "Change integration client details": true,
                    "Change service name": false,
                    "Request to join private beta": false
                }
            }
        ],
        pendingInvitations: [
            {
                userEmail: "james.pirot@gov.cabinet-office.gov.uk",
                permissions: {
                    "Manage team members": false,
                    "Change integration client details": false,
                    "Change service name": true,
                    "Request to join private beta": false
                }
            },
            {
                userEmail: "leighton.brey@gov.cabinet-office.gov.uk",
                permissions: {
                    "Manage team members": true,
                    "Change integration client details": true,
                    "Change service name": true,
                    "Request to join private beta": true
                }
            }
        ]
    });
});

//// Testing routes for Create 'invite team member' page
router.get("/invite-team-member", (req, res) => {
    res.render("service-details/invite-team-member.njk", {
        serviceName: "Frontend Test Service"
    });
});

router.post("/invite-team-member", emailValidator("service-details/invite-team-member.njk"), async (req, res) => {
    res.redirect("/invitation-sent");
});

//// Testing routes for 'Email invite sent' page
router.get("/invitation-sent", (req, res) => {
    res.render("service-details/invitation-sent.njk", {
        serviceName: "Frontend Test Service",
        userEmail: "james.pirot@digital.cabinet-office.gov.uk"
    });
});

//// Testing routes for Create the 'Add a name' page
router.get("/name-content-info", (req, res) => {
    res.render("name-content-info.njk");
});

router.post("/name-content-info", async (req, res) => {
    if (req.body.userName === "") {
        res.render("name-content-info.njk", {
            errorMessages: {
                userName: "Enter your name"
            }
        });
        return;
    }
    res.redirect("/register/create-service");
});

//// Testing routes for 'Service unavailable' page
router.get("/service-unavailable", (req, res) => {
    res.render("service-unavailable.njk");
});

//// Testing routes for 'Enter the 6 digit security code from your authenticator app' page
router.get("/enter-app-code", (req, res) => {
    res.render("common/enter-app-code.njk");
});

router.post("/enter-app-code", (req, res) => {
    if (!req.body.securityCode) {
        res.render("common/enter-app-code.njk", {
            errorMessages: {
                securityCode: "Enter the 6 digit code from your authenticator app"
            }
        });
        return;
    }
    res.redirect("/client-details-testonly-url");
});

//// Testing routes for 'Choose how to get your security code' page
router.get("/choose-security-codes", (req, res) => {
    res.render("create-account/choose-security-codes.njk");
});

router.post("/choose-security-codes", (req, res) => {
    if (!req.body.chooseSecurityCodeMethod) {
        res.render("create-account/choose-security-codes.njk", {
            errorMessages: {
                "chooseSecurityCodeMethod-options": "Select how to get security codes"
            }
        });
        return;
    }
    if (req.body.chooseSecurityCodeMethod === "authenticator") {
        res.redirect("/set-up-auth-app");
        return;
    }
    if (req.body.chooseSecurityCodeMethod === "textMessage") {
        res.redirect("/create/enter-mobile-test-url");
        return;
    }
});

////// Testing routes for 'Set up authenticator app' page
router.get("/set-up-auth-app", (req, res) => {
    res.render("create-account/set-up-auth-app.njk", {
        qrCodeUrl: "/assets/images/test-qr-code.png"
    });
});

router.post("/set-up-auth-app", (req, res) => {
    if (!req.body.securityCode) {
        res.render("create-account/set-up-auth-app.njk", {
            qrCodeUrl: "/assets/images/test-qr-code.png",
            errorMessages: {
                securityCode: "Enter the 6 digit code"
            }
        });
        return;
    }
    res.redirect("/service-name-testing");
});
