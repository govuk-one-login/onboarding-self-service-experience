import express from "express";
import {convertPublicKeyForAuth} from "../middleware/convertPublicKeyForAuth";
import {emailValidator} from "../middleware/validators/emailValidator";
import {passwordValidator} from "../middleware/validators/passwordValidator";
import {urisValidator} from "../middleware/validators/urisValidator";
import validateMobileNumber from "../middleware/validators/mobileValidator";
import SelfServiceServicesService from "../services/self-service-services-service";

const router = express.Router();

// Testing routes for Change your client name page
router.get("/change-client-name/:serviceId/:selfServiceClientId/:clientId", (req, res) => {
    res.render("service-details/change-client-name.njk", {
        value: req.query?.clientName,
        serviceId: req.params.serviceId,
        selfServiceClientId: req.params.selfServiceClientId,
        clientId: req.params.clientId
    });
});

router.post("/change-client-name/:serviceId/:selfServiceClientId/:clientId", async (req, res) => {
    const clientName = req.body.clientName;
    if (clientName === "") {
        const errorMessages = new Map<string, string>();
        errorMessages.set("clientName", "Enter your client name");
        res.render("service-details/change-client-name.njk", {errorMessages: errorMessages, clientId: req.params.clientId});
        return;
    }
    const s4: SelfServiceServicesService = req.app.get("backing-service");
    try {
        await s4.updateClient(
            req.params.serviceId,
            req.params.selfServiceClientId,
            req.params.clientId,
            {data: clientName},
            req.session.authenticationResult?.AccessToken as string
        );
    } catch (error) {
        console.error(error);
        res.redirect("/there-is-a-problem");
        return;
    }
    req.session.updatedField = "client name";
    res.redirect(`/client-details/${req.params.serviceId}`);
});

// Testing routes for Change your redirect URIs page
router.get("/change-redirect-uris/:serviceId/:selfServiceClientId/:clientId", (req, res) => {
    res.render("service-details/change-redirect-uris.njk", {
        value: req.query?.redirectUris,
        serviceId: req.params.serviceId,
        selfServiceClientId: req.params.selfServiceClientId,
        clientId: req.params.clientId
    });
});

router.post(
    "/change-redirect-uris/:serviceId/:selfServiceClientId/:clientId",
    urisValidator("service-details/change-redirect-uris.njk", "redirectURIs"),
    async (req, res) => {
        const redirectUris = req.body.redirectURIs.split(" ").filter((url: string) => url !== "");
        const s4: SelfServiceServicesService = req.app.get("backing-service");

        try {
            await s4.updateClient(
                req.params.serviceId,
                req.params.selfServiceClientId,
                req.params.clientId,
                {redirect_uris: redirectUris},
                req.session.authenticationResult?.AccessToken as string
            );
        } catch (error) {
            console.error(error);
            res.redirect("/there-is-a-problem");
            return;
        }
        req.session.updatedField = "redirect URLs";
        res.redirect(`/client-details/${req.params.serviceId}`);
    }
);

// Testing routes for Change user attributes page
router.get("/change-user-attributes/:serviceId/:selfServiceClientId/:clientId", (req, res) => {
    const userAttributes = (req.query?.userAttributes as string).split(" ");
    const email: boolean = userAttributes.includes("email");
    const phone: boolean = userAttributes.includes("phone");
    const offline_access: boolean = userAttributes.includes("offline_access");

    res.render("service-details/change-user-attributes.njk", {
        email: email,
        phone: phone,
        offline_access: offline_access,
        serviceId: req.params.serviceId,
        selfServiceClientId: req.params.selfServiceClientId,
        clientId: req.params.clientId
    });
});

router.post("/change-user-attributes/:serviceId/:selfServiceClientId/:clientId", async (req, res) => {
    const s4: SelfServiceServicesService = req.app.get("backing-service");
    const attributes: string[] = ["openid"];

    if (Array.isArray(req.body.userAttributes)) {
        attributes.push(...req.body.userAttributes);
    } else if (typeof req.body.userAttributes === "string") {
        attributes.push(req.body.userAttributes);
    }
    try {
        await s4.updateClient(
            req.params.serviceId,
            req.params.selfServiceClientId,
            req.params.clientId,
            {scopes: attributes},
            req.session.authenticationResult?.AccessToken as string
        );
    } catch (error) {
        console.error(error);
        res.redirect("/there-is-a-problem");
        return;
    }
    req.session.updatedField = "required user attributes";
    res.redirect(`/client-details/${req.params.serviceId}`);
});

// Testing routes for Change your post logout redirect URIs page
router.get("/change-post-logout-uris/:serviceId/:selfServiceClientId/:clientId", (req, res) => {
    res.render("service-details/change-post-logout-uris.njk", {
        value: req.query?.redirectUris, // this is not clientName
        serviceId: req.params.serviceId,
        selfServiceClientId: req.params.selfServiceClientId,
        clientId: req.params.clientId
    });
});

router.post(
    "/change-post-logout-uris/:serviceId/:selfServiceClientId/:clientId",
    urisValidator("service-details/change-post-logout-uris.njk", "postLogoutURIs"),
    async (req, res) => {
        const postLogoutUris = req.body.postLogoutURIs.split(" ").filter((url: string) => url !== "");
        const s4: SelfServiceServicesService = req.app.get("backing-service");
        try {
            await s4.updateClient(
                req.params.serviceId,
                req.params.selfServiceClientId,
                req.params.clientId,
                {post_logout_redirect_uris: postLogoutUris},
                req.session.authenticationResult?.AccessToken as string
            );
        } catch (error) {
            console.error(error);
            res.redirect("/there-is-a-problem");
            return;
        }
        req.session.updatedField = "post-logout redirect URLs";
        res.redirect(`/client-details/${req.params.serviceId}`);
    }
);

// Testing routes for Change your public key page
router.get("/change-public-key/:serviceId/:selfServiceClientId/:clientId", (req, res) => {
    res.render("service-details/change-public-key.njk", {
        value: "", // this is not clientName
        serviceId: req.params.serviceId,
        selfServiceClientId: req.params.selfServiceClientId,
        clientId: req.params.clientId
    });
});

router.post("/change-public-key/:serviceId/:selfServiceClientId/:clientId", convertPublicKeyForAuth, async (req, res) => {
    const publicKey = req.body.authCompliantPublicKey as string;
    const s4: SelfServiceServicesService = req.app.get("backing-service");
    try {
        await s4.updateClient(
            req.params.serviceId,
            req.params.selfServiceClientId,
            req.params.clientId,
            {public_key: publicKey},
            req.session.authenticationResult?.AccessToken as string
        );
    } catch (error) {
        console.error(error);
        res.redirect("/there-is-a-problem");
        return;
    }
    req.session.updatedField = "public key";
    res.redirect(`/client-details/${req.params.serviceId}`);
});

// Testing route for "Finish connecting the sign in journey to your service" page
router.get("/redirect-placeholder", (req, res) => {
    res.render("service-details/finish-connecting-sign-in-journey.njk", {
        changeRedirectUrisUrl: "/change-redirect-uris/:serviceId/:selfServiceClientId/:clientId",
        changePublicKeyUrl: "/change-public-key/:serviceId/:selfServiceClientId/:clientId"
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
router.post("/change-public-key-v2/mockedServiceId/mockedSelfServiceClientId/mockedClientId", async (req, res) => {
    const serviceUserPublicKey = req.body.serviceUserPublicKey;
    const serviceUserPublicKeyText = req.body.serviceUserPublicKeyText;
    const serviceUserPublicKeyFile = req.body.serviceUserPublicKeyFile;

    if (serviceUserPublicKey === "text" && serviceUserPublicKeyText === "") {
        const errorMessages = new Map<string, string>();
        errorMessages.set("serviceUserPublicKeyText", "Enter a public key");
        res.render("service-details/change-public-key-v2.njk", {
            errorMessages: errorMessages,
            serviceId: "mockedServiceId",
            selfServiceClientId: "mockedSelfServiceClientId",
            clientId: "mockedClientId",
            serviceName: "My juggling service",
            serviceUserPublicKey: "text"
        });
        return;
    }

    if (serviceUserPublicKey === "file" && serviceUserPublicKeyFile === "") {
        const errorMessages = new Map<string, string>();
        errorMessages.set("serviceUserPublicKeyFile", "Upload a file");
        res.render("service-details/change-public-key-v2.njk", {
            errorMessages: errorMessages,
            serviceId: "mockedServiceId",
            selfServiceClientId: "mockedSelfServiceClientId",
            clientId: "mockedClientId",
            serviceName: "My juggling service",
            serviceUserPublicKey: "file"
        });
        return;
    }

    if (serviceUserPublicKeyText === "" && serviceUserPublicKeyFile === "") {
        const errorMessages = new Map<string, string>();
        errorMessages.set("serviceUserPublicKey", "Choose how to change your public key");
        res.render("service-details/change-public-key-v2.njk", {
            errorMessages: errorMessages,
            serviceId: "mockedServiceId",
            selfServiceClientId: "mockedSelfServiceClientId",
            clientId: "mockedClientId",
            serviceName: "My juggling service"
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
        emailAddress: "your.email@digital.cabinet-office.gov.uk"
    });
});

router.post("/change-email-address", emailValidator("account/change-email-address.njk"), async (req, res) => {
    res.redirect("/account");
});

// Testing routes for Check your email address page
// The url needs to be updated when implementing functionality
router.get("/check-email-visual-test", (req, res) => {
    res.render("account/check-email.njk", {
        emailAddress: "email@address.com"
    });
});

router.post("/check-email-visual-test", async (req, res) => {
    const otp = req.body["change-email-otp"];
    if (otp === "") {
        const errorMessages = new Map<string, string>();
        errorMessages.set("change-email-otp", "Your code should be 6 characters long");
        res.render("account/check-email.njk", {errorMessages: errorMessages});
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

//// Testing route 'Form submitted' page for private beta
router.get("/private-beta-form-submitted", (req, res) => {
    res.render("service-details/private-beta-form-submitted.njk", {
        serviceName: "My juggling service"
    });
});

//// Testing routs Create 'Joining a private beta' page
router.get("/private-beta", (req, res) => {
    res.render("service-details/private-beta.njk", {
        serviceName: req.query.serviceName,
        emailAddress: req.session.emailAddress
    });
});

router.post("/private-beta", async (req, res) => {
    const yourName = req.body.yourName;
    const department = req.body.department;
    const emailAddress = req.body.emailAddress;
    const serviceName = req.body.serviceName;

    if (yourName === "" && department === "") {
        const errorMessages = new Map<string, string>();
        errorMessages.set("yourName", "Enter your name");
        errorMessages.set("department", "Enter your department");
        const value: object = {
            yourName: yourName,
            department: department
        };
        res.render("service-details/private-beta.njk", {
            errorMessages: errorMessages,
            value: value
        });
        return;
    }

    if (yourName === "") {
        const errorMessages = new Map<string, string>();
        errorMessages.set("yourName", "Enter your name");
        const value: object = {
            yourName: yourName,
            department: department
        };
        res.render("service-details/private-beta.njk", {
            errorMessages: errorMessages,
            value: value
        });
        return;
    }

    if (department === "") {
        const errorMessages = new Map<string, string>();
        errorMessages.set("department", "Enter your department");
        const value: object = {
            yourName: yourName,
            department: department
        };
        res.render("service-details/private-beta.njk", {
            errorMessages: errorMessages,
            value: value
        });
        return;
    }

    const s4: SelfServiceServicesService = req.app.get("backing-service");
    try {
        await s4.privateBetaRequest(
            yourName,
            department,
            serviceName,
            emailAddress,
            req.session.authenticationResult?.AccessToken as string
        );
    } catch (error) {
        console.error(error);
        res.redirect("/there-is-a-problem");
        return;
    }

    res.redirect("/private-beta-form-submitted");
});

// Testing route for testing when the private beta request has already been submitted.
router.get("/private-beta-submitted", (req, res) => {
    res.render("service-details/private-beta.njk", {
        serviceName: "My juggling service",
        privateBetaRequestSubmitted: true,
        dateRequestSubmitted: "10 May 2022"
    });
});

// Testing route for 'Problem with the service' page
router.get("/there-is-a-problem-test", (req, res) => {
    res.render("there-is-a-problem.njk");
});

// Testing routs Create the 'forgot your password' page
router.get("/forgot-password", (req, res) => {
    res.render("forgot-password.njk", {
        emailAddress: "your.email@digital.cabinet-office.gov.uk"
    });
});

// Testing routs 'Check your email for a password reset link' page
router.get("/check-email-password-reset", (req, res) => {
    res.render("check-email-password-reset.njk");
});
// Create the 'Create a new password' page
router.get("/create-new-password", (req, res) => {
    res.render("create-new-password.njk");
});

router.post("/create-new-password", passwordValidator("create-new-password.njk"), async (req, res) => {
    res.redirect("/check-yourphonetestpage");
});

// Testing routs for 'We need to do security checks' page
router.get("/security-check-change-number", (req, res) => {
    res.render("security-check-change-number.njk", {
        emailAddress: "your.email@digital.cabinet-office.gov.uk"
    });
});

router.post("/security-check-change-number", async (req, res) => {
    const emailOtp = req.body["create-email-otp"];
    if (emailOtp === "") {
        const errorMessages = new Map<string, string>();
        errorMessages.set("create-email-otp", "Enter the security code");
        res.render("security-check-change-number.njk", {
            errorMessages: errorMessages,
            emailAddress: "your.email@digital.cabinet-office.gov.uk"
        });
        return;
    }

    res.redirect("/confirm-phone-number");
});

// Testing routes for 'Confirm the phone number' page
router.get("/confirm-phone-number", (req, res) => {
    res.render("confirm-phone-number.njk");
});

router.post("/confirm-phone-number", validateMobileNumber("confirm-phone-number.njk"), async (req, res) => {
    res.redirect("/new-phone-number");
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
    res.render("check-mobile.njk");
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
    res.render("check-mobile.njk");
});

//// Testing routes for 'You entered the wrong mobile security code too many times' page
//// The code below is for frontend/visual testing purposes only

router.get("/wrong-text-code", (req, res) => {
    res.render("wrong-otp-too-many-times.njk", {
        values: {
            pageTitle: "Wrong text message code entered too many times",
            formActionUrl: "/wrong-text-code"
        }
    });
});

// When implementing the backend, depending on journey we should request new code and after that redirect (/create/enter-mobile or /sign-in-otp-mobile) or render the appropriate template - depending on implementation
router.post("/wrong-text-code", async (req, res) => {
    res.render("check-mobile.njk");
});

//// Testing routes for 'You entered the wrong email security code too many times' page
router.get("/wrong-email-code", (req, res) => {
    res.render("wrong-otp-too-many-times.njk", {
        values: {
            pageTitle: "Wrong email code entered too many times",
            formActionUrl: "/wrong-email-code"
        }
    });
});
// When implementing the backend, depending on journey we should request new code and after that redirect or render the appropriate template - depending on implementation
router.post("/wrong-email-code", async (req, res) => {
    res.render("account/check-email.njk");
});

export default router;
