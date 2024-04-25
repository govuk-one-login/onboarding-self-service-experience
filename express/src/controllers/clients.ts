import {RequestHandler} from "express";
import getAuthApiCompliantPublicKey from "../lib/public-key";
import SelfServiceServicesService from "../services/self-service-services-service";
import AuthenticationResultParser from "../lib/authentication-result-parser";
import {v4 as uuid_4} from "uuid";
import SheetsService from "../lib/sheets/SheetsService";
import console from "console";
import getTimestamp from "../lib/timestamp";

const defaultPublicKey =
    "MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEAp2mLkQGo24Kz1rut0oZlviMkGomlQCH+iT1pFvegZFXq39NPjRWyatmXp/XIUPqCq9Kk8/+tq4Sgjw+EM5tATJ06j5r+35of58ATGVPniW//IhGizrv6/ebGcGEUJ0Y/ZmlCHYPV+lbewpttQ/IYKM1nr3k/Rl6qepbVYe+MpGubluQvdhgUYel9OzxiOvUk7XI0axPquiXzoEgmNNOai8+WhYTkBqE3/OucAv+XwXdnx4XHmKzMwTv93dYMpUmvTxWcSeEJ/4/SrbiK4PyHWVKU2BozfSUejVNhahAzZeyyDwhYJmhBaZi/3eOOlqGXj9UdkOXbl3vcwBH8wD30O9/4F5ERLKxzOaMnKZ+RpnygWF0qFhf+UeFMy+O06sdgiaFnXaSCsIy/SohspkKiLjNnhvrDNmPLMQbQKQlJdcp6zUzI7Gzys7luEmOxyMpA32lDBQcjL7KNwM15s4ytfrJ46XEPZUXESce2gj6NazcPPsrTa/Q2+oLS9GWupGh7AgMBAAE=";

export const showClient: RequestHandler = async (req, res) => {
    // TODO make S4 instances static in all controllers
    const s4: SelfServiceServicesService = req.app.get("backing-service");
    const serviceId = nonNull(req.context.serviceId);
    const clients = await s4.listClients(serviceId, nonNull(req.session.authenticationResult?.AccessToken));
    const client = clients[0];
    const selfServiceClientId = client.dynamoServiceId;
    const authClientId = client.authClientId;
    const serviceName = client.serviceName;
    const redirectUrls = client.redirectUris;
    const userPublicKey = client.publicKey == defaultPublicKey ? "" : getAuthApiCompliantPublicKey(client.publicKey);

    res.render("clients/client-details.njk", {
        clientId: authClientId,
        selfServiceClientId: selfServiceClientId,
        serviceId: serviceId,
        serviceName: serviceName,
        updatedField: req.session.updatedField,
        redirectUrls: redirectUrls,
        userAttributesRequired: client.scopes,
        ...(client.token_endpoint_auth_method === "client_secret_post"
            ? {client_secret: client.client_secret ?? ""}
            : {userPublicKey: userPublicKey}),
        back_channel_logout_uri: client.back_channel_logout_uri,
        sector_identifier_uri: client.sector_identifier_uri,
        postLogoutRedirectUrls: client.postLogoutUris.join(" "),
        claims: client.identity_verification_enabled && client.hasOwnProperty("claims") ? client.claims : [],
        token_endpoint_auth_method: client.token_endpoint_auth_method,
        urls: {
            // TODO changeClientName is currently not used
            changeClientName: `/test/services/${serviceId}/clients/${authClientId}/${selfServiceClientId}/change-client-name?clientName=${encodeURIComponent(
                client.clientName
            )}`,
            changeRedirectUris: `/services/${serviceId}/clients/${authClientId}/${selfServiceClientId}/change-redirect-uris?redirectUris=${encodeURIComponent(
                client.redirectUris.join(" ")
            )}`,
            changeUserAttributes: `/services/${serviceId}/clients/${authClientId}/${selfServiceClientId}/change-user-attributes?userAttributes=${encodeURIComponent(
                client.scopes.join(" ")
            )}`,
            changePublicKey: `/services/${serviceId}/clients/${authClientId}/${selfServiceClientId}/change-public-key?publicKey=${encodeURIComponent(
                userPublicKey
            )}`,
            changePostLogoutUris: `/services/${serviceId}/clients/${authClientId}/${selfServiceClientId}/change-post-logout-uris?redirectUris=${encodeURIComponent(
                client.postLogoutUris.join(" ")
            )}`
        }
    });

    // TODO we need to use a flash message package for Express
    req.session.serviceName = client.serviceName ? client.serviceName : client.clientName;
    req.session.updatedField = undefined;
};

export const showPublicBetaForm: RequestHandler = (req, res) => {
    res.render("clients/public-beta.njk", {
        serviceId: req.context.serviceId,
        selfServiceClientId: req.params.selfServiceClientId,
        clientId: req.params.clientId,
        serviceName: req.session.serviceName,
        emailAddress: req.session.emailAddress
    });
};

export const processPublicBetaForm: RequestHandler = async (req, res) => {
    const {body, session, context, params} = req;

    const values = new Map<string, string>(Object.entries(body).map(([key, value]) => [key, String(value).trim()]));

    const {serviceName, serviceUse, migrateExistingAccounts} = body;

    const {emailAddress} = session;
    const {serviceId} = context;
    const {selfServiceClientId, clientId} = params;

    const errorMessages = new Map<string, string>();
    const requiredFields = [
        {key: "userName", message: "Enter your name"},
        {key: "organisationName", message: "Enter your organisation name"}
    ];

    requiredFields.forEach(({key, message}) => {
        if (body[key] === "") {
            errorMessages.set(key, message);
        }
    });

    if (!serviceUse) errorMessages.set("serviceUse-options", "Service use is required");
    if (!migrateExistingAccounts) errorMessages.set("migrateExistingAccounts-options", "Migration of existing accounts is required");

    if (errorMessages.size > 0) {
        return res.render("clients/public-beta.njk", {
            serviceId,
            selfServiceClientId,
            clientId,
            serviceName,
            emailAddress,
            errorMessages: Object.fromEntries(errorMessages),
            values: Object.fromEntries(values)
        });
    }

    const totalAnnualNumberMappings = {
        range1To1000: "1 to 1,000",
        range1001To50000: "1,001 to 50,000",
        range50001To250000: "50,001 to 250,000",
        range250001To1Million: "250,001 to 1 million",
        rangeOver1Million: "Over 1 million users",
        notSure: "Not sure"
    };
    for (const [key, value] of Object.entries(totalAnnualNumberMappings)) {
        if (req.body.numberOfUsersEachYear === key) {
            values.set("numberOfUsersEachYear", value);
            break;
        }
    }

    values.set("serviceUse", serviceUse === "signUsersIn" ? "To sign users in" : "To sign users in and check their identity");
    values.set("migrateExistingAccounts", migrateExistingAccounts === "yes" ? "Yes" : migrateExistingAccounts === "no" ? "No" : "Not sure");

    values.set("id", uuid_4());
    values.set("submission-date", getTimestamp());

    if (emailAddress) {
        values.set("email", emailAddress);
    }

    const keysToCheck = ["targetDate-day", "targetDate-month", "targetDate-year"];
    const output = keysToCheck
        .map(key => values.get(key))
        .filter(Boolean)
        .join("/");
    if (output) {
        values.set("estimatedServiceGoLiveDate", output);
    }
    const sheetsService: SheetsService = new SheetsService(process.env.USER_SIGNUP_SHEET_ID as string);
    await sheetsService.init().catch(error => console.error("updateUserSpreadsheet: " + error));
    await sheetsService
        .appendValues(values, process.env.PUBLIC_BETA_SHEET_DATA_RANGE as string, process.env.PUBLIC_BETA_SHEET_HEADER_RANGE as string)
        .then(() => console.log("Saved to Public Beta Spreadsheet"))
        .catch(reason => {
            console.error("updatePublicBetaSpreadsheet: " + reason);
        });
    const s4: SelfServiceServicesService = req.app.get("backing-service");
    const userId = AuthenticationResultParser.getCognitoId(nonNull(req.session.authenticationResult));
    s4.sendTxMALog(
        "SSE_PUBLIC_BETA_FORM_SUBMITTED",
        {
            session_id: req.session.id,
            ip_address: req.ip,
            user_id: userId
        },
        {
            service_id: serviceId
        }
    );
    res.redirect(`/services/${serviceId}/clients/${clientId}/${selfServiceClientId}/public-beta/submitted`);
};

export const showPublicBetaFormSubmitted: RequestHandler = (req, res) => {
    res.render("clients/public-beta-form-submitted.njk", {
        serviceId: req.context.serviceId,
        selfServiceClientId: req.params.selfServiceClientId,
        clientId: req.params.clientId
    });
};

export const showChangeServiceNameForm: RequestHandler = (req, res) => {
    res.render("clients/change-service-name.njk", {
        serviceId: req.context.serviceId,
        values: {
            serviceName: req.query.serviceName
        }
    });
};

export const processChangeServiceNameForm: RequestHandler = async (req, res) => {
    const newServiceName = req.body.serviceName;
    const serviceId = nonNull(req.context.serviceId);

    if (newServiceName === "") {
        return res.render("clients/change-service-name.njk", {
            serviceId: serviceId,
            errorMessages: {
                serviceName: "Enter your service name"
            }
        });
    }

    const s4: SelfServiceServicesService = req.app.get("backing-service");
    const userId = AuthenticationResultParser.getCognitoId(nonNull(req.session.authenticationResult));

    await s4.updateService(serviceId, {service_name: newServiceName}, nonNull(req.session.authenticationResult?.AccessToken));

    req.session.updatedField = "service name";
    req.session.serviceName = newServiceName;

    s4.sendTxMALog(
        "SSE_UPDATE_SERVICE_NAME",
        {
            session_id: req.session.id,
            ip_address: req.ip,
            user_id: userId
        },
        {
            service_name: newServiceName
        }
    );

    res.redirect(`/services/${serviceId}/clients`);
};

export const showChangePublicKeyForm: RequestHandler = (req, res) => {
    res.render("clients/change-public-key.njk", {
        serviceId: req.context.serviceId,
        selfServiceClientId: req.params.selfServiceClientId,
        clientId: req.params.clientId,
        serviceUserPublicKey: req.query.publicKey
    });
};

export const processChangePublicKeyForm: RequestHandler = async (req, res) => {
    const s4: SelfServiceServicesService = req.app.get("backing-service");
    const userId = AuthenticationResultParser.getCognitoId(nonNull(req.session.authenticationResult));

    console.info("Process Change of Public Key Form");
    await s4.updateClient(
        nonNull(req.context.serviceId),
        req.params.selfServiceClientId,
        req.params.clientId,
        {public_key: req.body.authCompliantPublicKey},
        nonNull(req.session.authenticationResult?.AccessToken)
    );

    req.session.updatedField = "public key";

    if (req.params.selfServiceClientId !== "") {
        s4.sendTxMALog(
            "SSE_UPDATE_PUBLIC_KEY",
            {
                session_id: req.session.id,
                ip_address: req.ip,
                user_id: userId
            },
            {
                service_id: nonNull(req.context.serviceId)
            }
        );
    } else {
        s4.sendTxMALog(
            "SSE_PUBLIC_KEY_ADDED",
            {
                session_id: req.session.id,
                ip_address: req.ip,
                user_id: userId
            },
            {
                service_id: nonNull(req.context.serviceId)
            }
        );
    }

    res.redirect(`/services/${req.context.serviceId}/clients`);
};

export const showChangeRedirectUrlsForm: RequestHandler = (req, res) => {
    res.render("clients/change-redirect-uris.njk", {
        serviceId: req.context.serviceId,
        selfServiceClientId: req.params.selfServiceClientId,
        clientId: req.params.clientId,
        values: {
            redirectUris: req.query.redirectUris
        }
    });
};

export const processChangeRedirectUrlsForm: RequestHandler = async (req, res) => {
    const redirectUris = req.body.redirectUris.split(" ").filter((url: string) => url.trim().length > 0);
    const s4: SelfServiceServicesService = req.app.get("backing-service");
    const userId = AuthenticationResultParser.getCognitoId(nonNull(req.session.authenticationResult));

    await s4.updateClient(
        nonNull(req.context.serviceId),
        req.params.selfServiceClientId,
        req.params.clientId,
        {redirect_uris: redirectUris},
        nonNull(req.session.authenticationResult?.AccessToken)
    );

    req.session.updatedField = "redirect URIs";

    s4.sendTxMALog(
        "SSE_UPDATE_REDIRECT_URL",
        {
            session_id: req.session.id,
            ip_address: req.ip,
            user_id: userId
        },
        {
            service_id: nonNull(req.context.serviceId)
        }
    );

    res.redirect(`/services/${req.context.serviceId}/clients`);
};

export const showChangeUserAttributesForm: RequestHandler = (req, res) => {
    res.render("clients/change-user-attributes.njk", {
        selectedUserAttributes: req.query.userAttributes?.toString().split(" "),
        serviceId: req.context.serviceId,
        selfServiceClientId: req.params.selfServiceClientId,
        clientId: req.params.clientId
    });
};

export const processChangeUserAttributesForm: RequestHandler = async (req, res) => {
    const s4: SelfServiceServicesService = req.app.get("backing-service");
    const attributes = ["openid"];

    if (Array.isArray(req.body.userAttributes)) {
        attributes.push(...req.body.userAttributes);
    } else if (typeof req.body.userAttributes === "string") {
        attributes.push(req.body.userAttributes);
    }

    await s4.updateClient(
        nonNull(req.context.serviceId),
        req.params.selfServiceClientId,
        req.params.clientId,
        {scopes: attributes},
        nonNull(req.session.authenticationResult?.AccessToken)
    );

    req.session.updatedField = "required user attributes";
    res.redirect(`/services/${req.context.serviceId}/clients`);
};

export const showChangePostLogoutUrisForm: RequestHandler = (req, res) => {
    res.render("clients/change-post-logout-uris.njk", {
        serviceId: req.context.serviceId,
        selfServiceClientId: req.params.selfServiceClientId,
        clientId: req.params.clientId,
        values: {
            redirectUris: req.query.redirectUris
        }
    });
};

export const processChangePostLogoutUrisForm: RequestHandler = async (req, res) => {
    const postLogoutUris = req.body.redirectUris.split(" ").filter((url: string) => url.trim().length > 0);
    const s4: SelfServiceServicesService = req.app.get("backing-service");
    const userId = AuthenticationResultParser.getCognitoId(nonNull(req.session.authenticationResult));

    await s4.updateClient(
        nonNull(req.context.serviceId),
        req.params.selfServiceClientId,
        req.params.clientId,
        {post_logout_redirect_uris: postLogoutUris},
        nonNull(req.session.authenticationResult?.AccessToken)
    );

    req.session.updatedField = "post-logout redirect URIs";

    s4.sendTxMALog(
        "SSE_UPDATE_LOGOUT_REDIRECT_URL",
        {
            session_id: req.session.id,
            ip_address: req.ip,
            user_id: userId
        },
        {
            service_id: nonNull(req.context.serviceId)
        }
    );

    res.redirect(`/services/${req.context.serviceId}/clients`);
};
