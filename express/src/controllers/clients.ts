import {RequestHandler} from "express";
import getAuthApiCompliantPublicKey from "../lib/public-key";
import SelfServiceServicesService from "../services/self-service-services-service";
import AuthenticationResultParser from "../lib/authentication-result-parser";
import console from "console";
import {removeContact, addContact} from "../lib/updateContacts";
import validate from "../lib/validators/email-validator";
import {Request, Response} from "express-serve-static-core";

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
    const redirectUris = client.redirectUris;
    const userSectorIdentifierUri = client.sector_identifier_uri;
    const publicKeySource = client.publicKeySource;
    const userPublicKey = client.publicKey == defaultPublicKey ? "" : getAuthApiCompliantPublicKey(client.publicKey);
    const jwksUrl = client.jwksUri;
    const secretHash = client.client_secret ? client.client_secret : "";
    let displayedKey: string = client.token_endpoint_auth_method === "client_secret_post" ? secretHash : userPublicKey;
    const contacts = client.contacts;
    const identityVerificationSupported = client.identity_verification_supported;
    const claims = identityVerificationSupported && client.claims ? client.claims : [];
    const idTokenSigningAlgorithm = client.id_token_signing_algorithm ?? "";
    const maxAgeEnabled = client.max_age_enabled;
    const pkceEnforced = client.pkce_enforced;
    const landingPageUrl = client.landing_page_url;

    if (client.publicKeySource == "JWKS" && client.token_endpoint_auth_method != "client_secret_post") {
        displayedKey = client.jwksUri;
    }

    const successBannerMessage = req.session.updatedField
        ? generateSuccessBannerMessage(req.session.updatedField, identityVerificationSupported, landingPageUrl)
        : undefined;

    res.render("clients/client-details.njk", {
        clientId: authClientId,
        selfServiceClientId: selfServiceClientId,
        serviceId: serviceId,
        serviceName: serviceName,
        successBannerMessage: successBannerMessage,
        redirectUris: redirectUris,
        scopesRequired: client.scopes,
        ...(client.token_endpoint_auth_method === "client_secret_post"
            ? {client_secret: client.client_secret ?? ""}
            : {userPublicKey: userPublicKey}),
        backChannelLogoutUri: client.back_channel_logout_uri,
        sectorIdentifierUri: userSectorIdentifierUri,
        postLogoutRedirectUris: client.postLogoutUris,
        claims: claims,
        idTokenSigningAlgorithm,
        displayedKey: displayedKey,
        contacts: contacts,
        token_endpoint_auth_method: client.token_endpoint_auth_method,
        identityVerificationSupported: identityVerificationSupported,
        pkceEnforced: pkceEnforced,
        authMethod: client.token_endpoint_auth_method,
        ...(client.identity_verification_supported === true && {
            levelsOfConfidence: client.client_locs ? client.client_locs.join(" ") : ""
        }),
        maxAgeEnabled: maxAgeEnabled,
        landingPageUrl: landingPageUrl,
        urls: {
            // TODO changeClientName is currently not used
            changeClientName: `/services/${serviceId}/clients/${authClientId}/${selfServiceClientId}/change-client-name?clientName=${encodeURIComponent(
                client.clientName
            )}`,
            changeRedirectUris: `/services/${serviceId}/clients/${authClientId}/${selfServiceClientId}/change-redirect-uris`,
            changeScopes: `/services/${serviceId}/clients/${authClientId}/${selfServiceClientId}/change-scopes?scopes=${encodeURIComponent(
                client.scopes.join(" ")
            )}`,
            changePostLogoutUris:
                client.postLogoutUris.length === 0
                    ? `/services/${serviceId}/clients/${authClientId}/${selfServiceClientId}/add-post-logout-uri`
                    : `/services/${serviceId}/clients/${authClientId}/${selfServiceClientId}/change-post-logout-uris`,
            changeBackChannelLogoutUri: `/services/${serviceId}/clients/${authClientId}/${selfServiceClientId}/change-back-channel-logout-uri?backChannelLogoutUri=${encodeURIComponent(
                client.back_channel_logout_uri ?? ""
            )}`,
            changeSectorIdentifierUri: `/services/${serviceId}/clients/${authClientId}/${selfServiceClientId}/change-sector-identifier-uri?sectorIdentifierUri=${encodeURIComponent(
                userSectorIdentifierUri
            )}`,
            changeClaims: `/services/${serviceId}/clients/${authClientId}/${selfServiceClientId}/change-claims?claims=${encodeURIComponent(
                claims.join(" ")
            )}`,
            changeKeyUri:
                client.token_endpoint_auth_method === "client_secret_post"
                    ? `/services/${serviceId}/clients/${authClientId}/${selfServiceClientId}/enter-client-secret-hash?secretHash=${encodeURIComponent(
                          displayedKey
                      )}`
                    : `/services/${serviceId}/clients/${authClientId}/${selfServiceClientId}/change-public-key?publicKeySource=${encodeURIComponent(
                          publicKeySource
                      )}&publicKey=${encodeURIComponent(userPublicKey)}&jwksUrl=${encodeURIComponent(jwksUrl)}`,
            changeContacts: `/services/${serviceId}/clients/${authClientId}/${selfServiceClientId}/enter-contact`,
            changeIdVerificationEnabledUri: `/services/${serviceId}/clients/${authClientId}/${selfServiceClientId}/enter-identity-verification`,
            changeIdTokenSigningAlgorithm: `/services/${serviceId}/clients/${authClientId}/${selfServiceClientId}/change-id-token-signing-algorithm?algorithm=${encodeURIComponent(
                idTokenSigningAlgorithm
            )}`,
            changeLandingPageUrl: `/services/${serviceId}/clients/${authClientId}/${selfServiceClientId}/change-landing-page-url?landingPageUrl=${encodeURIComponent(
                landingPageUrl ?? ""
            )}`,
            changeMaxAgeEnabled: `/services/${serviceId}/clients/${authClientId}/${selfServiceClientId}/change-max-age-enabled`,
            changePKCEEnforcedUri: `/services/${serviceId}/clients/${authClientId}/${selfServiceClientId}/change-pkce-enforced`
        },
        basicAuthCreds: {
            username: process.env.BASIC_AUTH_USERNAME ?? "",
            password: process.env.BASIC_AUTH_PASSWORD ?? ""
        }
    });

    // TODO we need to use a flash message package for Express
    req.session.serviceName = client.serviceName ? client.serviceName : client.clientName;
    req.session.updatedField = undefined;
};

const generateSuccessBannerMessage = (updatedField?: string, identityVerificationSupported?: boolean, landingPageUrl?: string) => {
    let message;
    if (updatedField === "identity verification") {
        if (identityVerificationSupported) {
            message = "You have enabled identity verification.";
            if (!landingPageUrl) {
                message += " It is strongly recommended that you set a landing page URI.";
            }
        } else {
            message = "You have disabled identity verification.";
        }
    } else {
        message = `You have changed your ${updatedField}`;
    }
    return message;
};

export const showGoLivePage: RequestHandler = (req, res) => {
    res.render("clients/go-live.njk", {
        serviceId: req.context.serviceId,
        selfServiceClientId: req.params.selfServiceClientId,
        clientId: req.params.clientId,
        serviceName: req.session.serviceName,
        emailAddress: req.session.emailAddress
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

    await s4.updateService(
        serviceId,
        req.params.selfServiceClientId,
        req.params.clientId,
        {service_name: newServiceName},
        nonNull(req.session.authenticationResult?.AccessToken)
    );

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
        publicKeySource: req.query.publicKeySource,
        serviceUserPublicKey: req.query.publicKey,
        jwksUrl: req.query.jwksUrl
    });
};

export const processChangePublicKeyForm: RequestHandler = async (req, res) => {
    const s4: SelfServiceServicesService = req.app.get("backing-service");
    const userId = AuthenticationResultParser.getCognitoId(nonNull(req.session.authenticationResult));

    console.info("Process Change of Public Key Form");
    req.session.updatedField = "public key";
    req.session.save();

    await s4.updateClient(
        nonNull(req.context.serviceId),
        req.params.selfServiceClientId,
        req.params.clientId,
        req.body.update,
        nonNull(req.session.authenticationResult?.AccessToken)
    );

    if (req.params.selfServiceClientId !== "") {
        sendTxMALog(req, userId, "SSE_UPDATE_PUBLIC_KEY");
    } else {
        sendTxMALog(req, userId, "SSE_PUBLIC_KEY_ADDED");
    }

    res.redirect(`/services/${req.context.serviceId}/clients`);
};

export const showEnterClientSecretHashForm: RequestHandler = (req, res) => {
    res.render("clients/enter-client-secret-hash.njk", {
        serviceId: req.context.serviceId,
        selfServiceClientId: req.params.selfServiceClientId,
        clientId: req.params.clientId,
        secretHash: req.query.secretHash
    });
};

export const processEnterClientSecretHashForm: RequestHandler = async (req, res) => {
    const s4: SelfServiceServicesService = req.app.get("backing-service");
    const userId = AuthenticationResultParser.getCognitoId(nonNull(req.session.authenticationResult));

    await s4.updateClient(
        nonNull(req.context.serviceId),
        req.params.selfServiceClientId,
        req.params.clientId,
        {client_secret: req.body.secretHash},
        nonNull(req.session.authenticationResult?.AccessToken)
    );

    req.session.updatedField = "secret hash";

    if (req.params.selfServiceClientId !== "") {
        sendTxMALog(req, userId, "SSE_UPDATE_SECRET_HASH");
    } else {
        sendTxMALog(req, userId, "SSE_SECRET_HASH_ADDED");
    }

    res.redirect(`/services/${req.context.serviceId}/clients`);
};

export const showChangeRedirectUrlsForm: RequestHandler = async (req, res) => {
    const s4: SelfServiceServicesService = req.app.get("backing-service");
    const serviceId = nonNull(req.context.serviceId);
    const clients = await s4.listClients(serviceId, nonNull(req.session.authenticationResult?.AccessToken));
    const client = clients[0];
    const redirectUris = client.redirectUris;
    const authClientId = client.authClientId;
    res.render("clients/change-redirect-uris.njk", {
        serviceId: req.context.serviceId,
        selfServiceClientId: req.params.selfServiceClientId,
        clientId: req.params.clientId,
        redirectUris,
        authClientId,
        updateResult: req.query.updateResult
    });
};

export const showAddRedirectUriForm: RequestHandler = async (req, res) => {
    const s4: SelfServiceServicesService = req.app.get("backing-service");
    const serviceId = nonNull(req.context.serviceId);
    const clients = await s4.listClients(serviceId, nonNull(req.session.authenticationResult?.AccessToken));
    const client = clients[0];
    const authClientId = client.authClientId;
    const redirectUris = client.redirectUris;
    res.render("clients/add-redirect-uri.njk", {
        serviceId: req.context.serviceId,
        selfServiceClientId: req.params.selfServiceClientId,
        clientId: req.params.clientId,
        authClientId,
        redirectUris
    });
};

export const processAddRedirectUriForm: RequestHandler = async (req, res) => {
    const redirectUriToAdd = req.body.redirectUri.trim();
    const s4: SelfServiceServicesService = req.app.get("backing-service");
    const serviceId = nonNull(req.context.serviceId);
    const clients = await s4.listClients(serviceId, nonNull(req.session.authenticationResult?.AccessToken));
    const client = clients[0];
    const currentRedirectUris = client.redirectUris;
    const userId = AuthenticationResultParser.getCognitoId(nonNull(req.session.authenticationResult));

    if (currentRedirectUris.includes(redirectUriToAdd)) {
        return res.redirect(
            `/services/${serviceId}/clients/${req.params.clientId}/${
                req.params.selfServiceClientId
            }/change-redirect-uris?updateResult=${encodeURIComponent("This URI has already been added")}`
        );
    }

    const newRedirectUris = [...currentRedirectUris, redirectUriToAdd];

    await s4.updateClient(
        nonNull(req.context.serviceId),
        req.params.selfServiceClientId,
        req.params.clientId,
        {redirect_uris: newRedirectUris},
        nonNull(req.session.authenticationResult?.AccessToken)
    );

    sendTxMALog(req, userId, "SSE_UPDATE_REDIRECT_URL");

    return res.redirect(
        `/services/${serviceId}/clients/${req.params.clientId}/${
            req.params.selfServiceClientId
        }/change-redirect-uris?updateResult=${encodeURIComponent("Redirect URIs updated")}`
    );
};

export const showConfirmRedirectUriRemovalForm: RequestHandler = async (req, res) => {
    const s4: SelfServiceServicesService = req.app.get("backing-service");
    const serviceId = nonNull(req.context.serviceId);
    const clients = await s4.listClients(serviceId, nonNull(req.session.authenticationResult?.AccessToken));
    const client = clients[0];
    const authClientId = client.authClientId;
    res.render("clients/confirm-redirect-uri-removal.njk", {
        serviceId: req.context.serviceId,
        selfServiceClientId: req.params.selfServiceClientId,
        clientId: req.params.clientId,
        authClientId,
        uriToRemove: req.query.uriToRemove
    });
};

export const processRemoveRedirectUriFrom: RequestHandler = async (req, res) => {
    const redirectUriToRemove = req.body.uriToRemove;
    const s4: SelfServiceServicesService = req.app.get("backing-service");
    const serviceId = nonNull(req.context.serviceId);
    const clients = await s4.listClients(serviceId, nonNull(req.session.authenticationResult?.AccessToken));
    const client = clients[0];
    const currentRedirectUris = client.redirectUris;
    const userId = AuthenticationResultParser.getCognitoId(nonNull(req.session.authenticationResult));

    if (req.body.removeUri === "yes") {
        if (!currentRedirectUris.includes(redirectUriToRemove)) {
            return res.redirect(
                `/services/${serviceId}/clients/${req.params.clientId}/${
                    req.params.selfServiceClientId
                }/change-redirect-uris?updateResult=${encodeURIComponent("Not updated. URI not found")}`
            );
        }

        if (currentRedirectUris.length === 1) {
            return res.redirect(
                `/services/${serviceId}/clients/${req.params.clientId}/${
                    req.params.selfServiceClientId
                }/change-redirect-uris?updateResult=${encodeURIComponent("Not updated. At least one redirect URI is required")}`
            );
        }

        const newPostLogoutRedirectUris = currentRedirectUris.filter(uri => uri !== redirectUriToRemove);
        await s4.updateClient(
            nonNull(req.context.serviceId),
            req.params.selfServiceClientId,
            req.params.clientId,
            {redirect_uris: newPostLogoutRedirectUris},
            nonNull(req.session.authenticationResult?.AccessToken)
        );

        sendTxMALog(req, userId, "SSE_UPDATE_REDIRECT_URL");

        res.redirect(
            `/services/${serviceId}/clients/${req.params.clientId}/${
                req.params.selfServiceClientId
            }/change-redirect-uris?updateResult=${encodeURIComponent("Redirect URIs updated")}`
        );
    } else if (req.body.removeUri === "no") {
        res.redirect(`/services/${serviceId}/clients/${req.params.clientId}/${req.params.selfServiceClientId}/change-redirect-uris`);
    } else {
        res.render("clients/confirm-redirect-uri-removal.njk", {
            serviceId: req.context.serviceId,
            authClientId: req.params.clientId,
            selfServiceClientId: req.params.selfServiceClientId,
            uriToRemove: req.query.uriToRemove,
            errorMessages: {
                "removeUri-options": "Select yes if you want to remove this redirect URI"
            }
        });
    }
};

export const showChangeScopesForm: RequestHandler = (req: Request, res: Response): void => {
    res.render("clients/change-scopes.njk", {
        selectedScopes: req.query.scopes?.toString().split(" "),
        serviceId: req.context.serviceId,
        selfServiceClientId: req.params.selfServiceClientId,
        clientId: req.params.clientId
    });
};

export const processChangeScopesForm: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const s4: SelfServiceServicesService = req.app.get("backing-service");
    const attributes = ["openid"];

    if (Array.isArray(req.body.scopes)) {
        attributes.push(...req.body.scopes);
    } else if (typeof req.body.scopes === "string") {
        attributes.push(req.body.scopes);
    }

    await s4.updateClient(
        nonNull(req.context.serviceId),
        req.params.selfServiceClientId,
        req.params.clientId,
        {scopes: attributes},
        nonNull(req.session.authenticationResult?.AccessToken)
    );

    const userId = AuthenticationResultParser.getCognitoId(nonNull(req.session.authenticationResult));

    sendTxMALog(req, userId, "SSE_CHANGE_SCOPES");

    req.session.updatedField = "scopes";
    res.redirect(`/services/${req.context.serviceId}/clients`);
};

export const showChangePostLogoutUrisForm: RequestHandler = async (req, res) => {
    const s4: SelfServiceServicesService = req.app.get("backing-service");
    const serviceId = nonNull(req.context.serviceId);
    const clients = await s4.listClients(serviceId, nonNull(req.session.authenticationResult?.AccessToken));
    const client = clients[0];
    const postLogoutRedirectUris = client.postLogoutUris;
    const authClientId = client.authClientId;
    res.render("clients/change-post-logout-uris.njk", {
        serviceId: req.context.serviceId,
        selfServiceClientId: req.params.selfServiceClientId,
        clientId: req.params.clientId,
        authClientId,
        postLogoutRedirectUris,
        updateResult: req.query.updateResult
    });
};

export const showAddPostLogoutUriForm: RequestHandler = async (req, res) => {
    const s4: SelfServiceServicesService = req.app.get("backing-service");
    const serviceId = nonNull(req.context.serviceId);
    const clients = await s4.listClients(serviceId, nonNull(req.session.authenticationResult?.AccessToken));
    const client = clients[0];
    const authClientId = client.authClientId;
    const postLogoutRedirectUris = client.postLogoutUris;
    res.render("clients/add-post-logout-uri.njk", {
        serviceId: req.context.serviceId,
        selfServiceClientId: req.params.selfServiceClientId,
        clientId: req.params.clientId,
        authClientId,
        postLogoutRedirectUris
    });
};

export const processAddPostLogoutUriForm: RequestHandler = async (req, res) => {
    const postLogoutRedirectUriToAdd = req.body.postLogoutRedirectUri.trim();
    const s4: SelfServiceServicesService = req.app.get("backing-service");
    const serviceId = nonNull(req.context.serviceId);
    const clients = await s4.listClients(serviceId, nonNull(req.session.authenticationResult?.AccessToken));
    const client = clients[0];
    const currentPostLogoutRedirectUris = client.postLogoutUris;
    const userId = AuthenticationResultParser.getCognitoId(nonNull(req.session.authenticationResult));

    if (currentPostLogoutRedirectUris.includes(postLogoutRedirectUriToAdd)) {
        return res.redirect(
            `/services/${serviceId}/clients/${req.params.clientId}/${
                req.params.selfServiceClientId
            }/change-post-logout-uris?updateResult=${encodeURIComponent("Not updated. URI already exists")}`
        );
    }

    const newPostLogoutRedirectUris = [...currentPostLogoutRedirectUris, postLogoutRedirectUriToAdd];

    await s4.updateClient(
        nonNull(req.context.serviceId),
        req.params.selfServiceClientId,
        req.params.clientId,
        {post_logout_redirect_uris: newPostLogoutRedirectUris},
        nonNull(req.session.authenticationResult?.AccessToken)
    );

    sendTxMALog(req, userId, "SSE_UPDATE_LOGOUT_REDIRECT_URL");

    return res.redirect(
        `/services/${serviceId}/clients/${req.params.clientId}/${
            req.params.selfServiceClientId
        }/change-post-logout-uris?updateResult=${encodeURIComponent("Post logout redirect URIs updated")}`
    );
};

export const showConfirmPostLogoutUriRemovalForm: RequestHandler = async (req, res) => {
    const s4: SelfServiceServicesService = req.app.get("backing-service");
    const serviceId = nonNull(req.context.serviceId);
    const clients = await s4.listClients(serviceId, nonNull(req.session.authenticationResult?.AccessToken));
    const client = clients[0];
    const authClientId = client.authClientId;
    res.render("clients/confirm-post-logout-uri-removal.njk", {
        serviceId: req.context.serviceId,
        selfServiceClientId: req.params.selfServiceClientId,
        clientId: req.params.clientId,
        authClientId,
        uriToRemove: req.query.uriToRemove
    });
};

export const processRemovePostLogoutUriFrom: RequestHandler = async (req, res) => {
    const postLogoutRedirectUriToRemove = req.body.uriToRemove;
    const s4: SelfServiceServicesService = req.app.get("backing-service");
    const serviceId = nonNull(req.context.serviceId);
    const clients = await s4.listClients(serviceId, nonNull(req.session.authenticationResult?.AccessToken));
    const client = clients[0];
    const currentPostLogoutRedirectUris = client.postLogoutUris;
    const userId = AuthenticationResultParser.getCognitoId(nonNull(req.session.authenticationResult));

    if (req.body.removeUri === "yes") {
        if (!currentPostLogoutRedirectUris.includes(postLogoutRedirectUriToRemove)) {
            return res.redirect(
                `/services/${serviceId}/clients/${req.params.clientId}/${
                    req.params.selfServiceClientId
                }/change-post-logout-uris?updateResult=${encodeURIComponent("Not updated. URI not found")}`
            );
        }
        const newPostLogoutRedirectUris = currentPostLogoutRedirectUris.filter(uri => uri !== postLogoutRedirectUriToRemove);
        await s4.updateClient(
            nonNull(req.context.serviceId),
            req.params.selfServiceClientId,
            req.params.clientId,
            {post_logout_redirect_uris: newPostLogoutRedirectUris},
            nonNull(req.session.authenticationResult?.AccessToken)
        );

        sendTxMALog(req, userId, "SSE_UPDATE_LOGOUT_REDIRECT_URL");

        if (newPostLogoutRedirectUris.length) {
            res.redirect(
                `/services/${serviceId}/clients/${req.params.clientId}/${
                    req.params.selfServiceClientId
                }/change-post-logout-uris?updateResult=${encodeURIComponent("Post logout redirect URIs updated")}`
            );
        } else {
            req.session.updatedField = "Post logout redirect URIs";
            res.redirect(`/services/${req.context.serviceId}/clients`);
        }
    } else if (req.body.removeUri === "no") {
        res.redirect(`/services/${serviceId}/clients/${req.params.clientId}/${req.params.selfServiceClientId}/change-post-logout-uris`);
    } else {
        res.render("clients/confirm-post-logout-uri-removal.njk", {
            serviceId: req.context.serviceId,
            authClientId: req.params.clientId,
            selfServiceClientId: req.params.selfServiceClientId,
            uriToRemove: req.query.uriToRemove,
            errorMessages: {
                "removeUri-options": "Select yes if you want to remove this post logout redirect URI"
            }
        });
    }
};

export const showChangeBackChannelLogoutUriForm: RequestHandler = (req, res) => {
    res.render("clients/change-back-channel-logout-uri.njk", {
        serviceId: req.context.serviceId,
        selfServiceClientId: req.params.selfServiceClientId,
        clientId: req.params.clientId,
        values: {
            backChannelLogoutUri: req.query.backChannelLogoutUri
        }
    });
};

export const processChangeBackChannelLogOutUriForm: RequestHandler = async (req, res) => {
    const backChannelLogoutUri = req.body.backChannelLogoutUri;
    const s4: SelfServiceServicesService = req.app.get("backing-service");

    await s4.updateClient(
        nonNull(req.context.serviceId),
        req.params.selfServiceClientId,
        req.params.clientId,
        {back_channel_logout_uri: backChannelLogoutUri},
        nonNull(req.session.authenticationResult?.AccessToken)
    );

    if (typeof backChannelLogoutUri === "string" && backChannelLogoutUri.trim().length > 0) {
        req.session.updatedField = "Back channel logout URI";
    }

    res.redirect(`/services/${req.context.serviceId}/clients`);
};

export const showChangeSectorIdentifierUriForm: RequestHandler = (req, res) => {
    res.render("clients/change-sector-identifier-uri.njk", {
        serviceId: req.context.serviceId,
        selfServiceClientId: req.params.selfServiceClientId,
        clientId: req.params.clientId,
        values: {
            sectorIdentifierUri: req.query.sectorIdentifierUri
        }
    });
};

export const processChangeSectorIdentifierUriForm: RequestHandler = async (req, res) => {
    const sectorIdentifierUri = req.body.sectorIdentifierUri;
    const s4: SelfServiceServicesService = req.app.get("backing-service");

    await s4.updateClient(
        nonNull(req.context.serviceId),
        req.params.selfServiceClientId,
        req.params.clientId,
        {sector_identifier_uri: sectorIdentifierUri},
        nonNull(req.session.authenticationResult?.AccessToken)
    );

    req.session.updatedField = "Sector Identifier URI";

    res.redirect(`/services/${req.context.serviceId}/clients`);
};

export const showEnterContactForm: RequestHandler = async (req, res) => {
    const s4: SelfServiceServicesService = req.app.get("backing-service");
    const serviceId = nonNull(req.context.serviceId);
    const clients = await s4.listClients(serviceId, nonNull(req.session.authenticationResult?.AccessToken));
    const client = clients[0];
    const contacts = client.contacts;
    const authClientId = client.authClientId;
    const selfServiceClientId = client.dynamoServiceId;
    res.render("clients/enter-contact.njk", {
        contacts: contacts,
        serviceId: serviceId,
        authClientId: authClientId,
        selfServiceClientId: selfServiceClientId,
        updateResult: req.query.updateResult
    });
};

export const showConfirmContactRemovalForm: RequestHandler = (req, res) => {
    res.render("clients/confirm-contact-removal.njk", {
        serviceId: req.context.serviceId,
        authClientId: req.params.clientId,
        selfServiceClientId: req.params.selfServiceClientId,
        contactToRemove: req.query.contactToRemove
    });
};

export const processConfirmContactRemovalForm: RequestHandler = async (req, res) => {
    const contactToRemove = req.body.contactToRemove;
    const s4: SelfServiceServicesService = req.app.get("backing-service");
    const serviceId = nonNull(req.context.serviceId);
    const clients = await s4.listClients(serviceId, nonNull(req.session.authenticationResult?.AccessToken));
    const client = clients[0];
    const contacts = client.contacts;

    if (req.body.removeContact === "yes") {
        const updateContactsResult = removeContact(contacts, contactToRemove);
        let updateMessage: string;
        if (typeof updateContactsResult === "string") {
            updateMessage = updateContactsResult;
        } else {
            await s4.updateClient(
                nonNull(req.context.serviceId),
                req.params.selfServiceClientId,
                req.params.clientId,
                {contacts: updateContactsResult},
                nonNull(req.session.authenticationResult?.AccessToken)
            );
            updateMessage = "Contacts updated";
        }
        res.redirect(
            `/services/${serviceId}/clients/${req.params.clientId}/${
                req.params.selfServiceClientId
            }/enter-contact?updateResult=${encodeURIComponent(updateMessage)}`
        );
    } else if (req.body.removeContact === "no") {
        res.redirect(`/services/${serviceId}/clients/${req.params.clientId}/${req.params.selfServiceClientId}/enter-contact`);
    } else {
        res.render("clients/confirm-contact-removal.njk", {
            serviceId: req.context.serviceId,
            authClientId: req.params.clientId,
            selfServiceClientId: req.params.selfServiceClientId,
            contactToRemove: req.query.contactToRemove,
            errorMessages: {
                "removeContact-options": "Select yes if you want to remove this contact"
            }
        });
    }
};

export const showEnterContactEmailForm: RequestHandler = (req, res) => {
    res.render("clients/enter-contact-email.njk", {
        serviceId: req.context.serviceId,
        authClientId: req.params.clientId,
        selfServiceClientId: req.params.selfServiceClientId
    });
};

export const processEnterContactEmailForm: RequestHandler = async (req, res) => {
    const contactToAdd = req.body.emailAddress;
    const s4: SelfServiceServicesService = req.app.get("backing-service");
    const serviceId = nonNull(req.context.serviceId);
    const clients = await s4.listClients(serviceId, nonNull(req.session.authenticationResult?.AccessToken));
    const client = clients[0];
    const contacts = client.contacts;

    const emailAddress = req.body.emailAddress.trim();
    const result = await validate(emailAddress);

    if (result.isValid) {
        const updateContactsResult = addContact(contactToAdd, contacts);

        if (typeof updateContactsResult === "string" && updateContactsResult === "This contact has already been added") {
            res.render("clients/enter-contact-email.njk", {
                values: {
                    emailAddress: emailAddress
                },
                errorMessages: {
                    emailAddress: updateContactsResult
                },
                serviceId: req.context.serviceId,
                authClientId: req.params.clientId,
                selfServiceClientId: req.params.selfServiceClientId
            });
        } else {
            await s4.updateClient(
                nonNull(req.context.serviceId),
                req.params.selfServiceClientId,
                req.params.clientId,
                {contacts: updateContactsResult},
                nonNull(req.session.authenticationResult?.AccessToken)
            );

            res.redirect(
                `/services/${serviceId}/clients/${req.params.clientId}/${
                    req.params.selfServiceClientId
                }/enter-contact?updateResult=${encodeURIComponent("Contacts updated")}`
            );
        }
    } else {
        res.render("clients/enter-contact-email.njk", {
            values: {
                emailAddress: emailAddress
            },
            errorMessages: {
                emailAddress: result.errorMessage
            },
            serviceId: req.context.serviceId,
            authClientId: req.params.clientId,
            selfServiceClientId: req.params.selfServiceClientId
        });
    }
};

export const showChangeClaimsForm: RequestHandler = (req: Request, res: Response): void => {
    res.render("clients/change-claims.njk", {
        claims: req.query.claims?.toString().split(" "),
        serviceId: req.context.serviceId,
        selfServiceClientId: req.params.selfServiceClientId,
        clientId: req.params.clientId
    });
};

export const processChangeClaimsForm: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const s4: SelfServiceServicesService = req.app.get("backing-service");

    const attributes = [];

    if (Array.isArray(req.body.claims)) {
        attributes.push(...req.body.claims);
    } else if (typeof req.body.claims === "string") {
        attributes.push(req.body.claims);
    }

    await s4.updateClient(
        nonNull(req.context.serviceId),
        req.params.selfServiceClientId,
        req.params.clientId,
        {claims: attributes},
        nonNull(req.session.authenticationResult?.AccessToken)
    );

    const userId = AuthenticationResultParser.getCognitoId(nonNull(req.session.authenticationResult));

    sendTxMALog(req, userId, "SSE_CHANGE_CLAIMS");

    req.session.updatedField = "claims";
    res.redirect(`/services/${req.context.serviceId}/clients`);
};

const sendTxMALog: (req: Request, userId: string, eventName: string) => void = (req: Request, userId: string, eventName: string): void => {
    const s4: SelfServiceServicesService = req.app.get("backing-service");
    s4.sendTxMALog(
        eventName,
        {
            session_id: req.session.id,
            ip_address: req.ip,
            user_id: userId
        },
        {
            service_id: nonNull(req.context.serviceId)
        }
    );
};

export const showEnterIdentityVerificationForm: RequestHandler = (req: Request, res: Response): void => {
    res.render("clients/enter-identity-verification.njk", {
        serviceId: req.context.serviceId,
        selfServiceClientId: req.params.selfServiceClientId,
        clientId: req.params.clientId
    });
};

export const processEnterIdentityVerificationForm = async (req: Request, res: Response): Promise<void> => {
    const {context, params, app, body, session} = req;
    const s4: SelfServiceServicesService = app.get("backing-service");

    const {serviceId} = context;

    const identityVerificationSupported = body.identityVerificationSupported;

    if (!identityVerificationSupported || (identityVerificationSupported !== "yes" && identityVerificationSupported !== "no")) {
        return res.render("clients/enter-identity-verification.njk", {
            serviceId: req.context.serviceId,
            selfServiceClientId: req.params.selfServiceClientId,
            clientId: req.params.clientId,
            errorMessages: {
                "identityVerificationSupported-options": "Select yes if you want to enable identity verification"
            }
        });
    }

    const identity_verification_supported = identityVerificationSupported === "yes";
    // sending flag to Client Register API
    await s4.updateClient(
        nonNull(context.serviceId),
        params.selfServiceClientId,
        params.clientId,
        {identity_verification_supported, accepted_levels_of_confidence: identity_verification_supported ? ["P2"] : ["P0"]},
        nonNull(session.authenticationResult?.AccessToken)
    );

    req.session.updatedField = "identity verification";
    res.redirect(`/services/${serviceId}/clients`);
};

export const showChangeClientName: RequestHandler = (req, res) => {
    res.render("clients/change-client-name.njk", {
        serviceId: req.context.serviceId,
        selfServiceClientId: req.params.selfServiceClientId,
        clientId: req.params.clientId,
        values: {
            clientName: req.query.clientName
        }
    });
};

export const processChangeClientName = async (req: Request, res: Response): Promise<void> => {
    const newClientName = req.body.clientName;

    if (newClientName === "") {
        res.render("clients/change-client-name.njk", {
            serviceId: req.context.serviceId,
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
            nonNull(req.context.serviceId),
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
    res.redirect(`/services/${req.context.serviceId}/clients`);
};

export const showChangeIdTokenAlgorithmForm: RequestHandler = (req, res) => {
    res.render("clients/change-id-token-algorithm.njk", {
        serviceId: req.context.serviceId,
        authClientId: req.params.clientId,
        selfServiceClientId: req.params.selfServiceClientId,
        algorithm: req.query.algorithm?.toString()
    });
};

export const processChangeIdTokenAlgorithmForm: RequestHandler = async (req, res) => {
    const newIdTokenSigningAlgorithm = req.body.idTokenSigningAlgorithm;
    const s4: SelfServiceServicesService = req.app.get("backing-service");
    const serviceId = nonNull(req.context.serviceId);

    await s4.updateClient(
        nonNull(req.context.serviceId),
        req.params.selfServiceClientId,
        req.params.clientId,
        {id_token_signing_algorithm: newIdTokenSigningAlgorithm},
        nonNull(req.session.authenticationResult?.AccessToken)
    );

    req.session.updatedField = "ID token signing algorithm";
    res.redirect(`/services/${serviceId}/clients`);
};

export const showMaxAgeEnabledForm: RequestHandler = (req: Request, res: Response): void => {
    res.render("clients/enter-max-age.njk", {
        serviceId: req.context.serviceId,
        selfServiceClientId: req.params.selfServiceClientId,
        clientId: req.params.clientId
    });
};

export const processMaxAgeEnabledForm = async (req: Request, res: Response): Promise<void> => {
    const {context, params, app, body, session} = req;
    const s4: SelfServiceServicesService = app.get("backing-service");

    const {serviceId} = context;

    const maxAgeEnabled = body.maxAgeEnabled;

    if (!maxAgeEnabled || (maxAgeEnabled !== "yes" && maxAgeEnabled !== "no")) {
        return res.render("clients/enter-max-age.njk", {
            serviceId: req.context.serviceId,
            selfServiceClientId: req.params.selfServiceClientId,
            clientId: req.params.clientId,
            errorMessages: {
                "maxAgeEnabled-options": "Select yes if you want to enable Max Age"
            }
        });
    }

    const max_age_enabled = maxAgeEnabled === "yes";
    // sending flag to Client Register API
    await s4.updateClient(
        nonNull(context.serviceId),
        params.selfServiceClientId,
        params.clientId,
        {max_age_enabled},
        nonNull(session.authenticationResult?.AccessToken)
    );

    req.session.updatedField = "Max Age Enabled";
    res.redirect(`/services/${serviceId}/clients`);
};

export const showChangePKCEEnforcedForm: RequestHandler = (req: Request, res: Response): void => {
    res.render("clients/change-pkce-enforced.njk", {
        serviceId: req.context.serviceId,
        selfServiceClientId: req.params.selfServiceClientId,
        clientId: req.params.clientId
    });
};

export const processChangePKCEEnforcedForm = async (req: Request, res: Response): Promise<void> => {
    const {context, params, app, body, session} = req;
    const s4: SelfServiceServicesService = app.get("backing-service");

    const {serviceId} = context;

    const pkceEnforced = body.pkceEnforced;

    if (!pkceEnforced || (pkceEnforced !== "yes" && pkceEnforced !== "no")) {
        return res.render("clients/change-pkce-enforced.njk", {
            serviceId: req.context.serviceId,
            selfServiceClientId: req.params.selfServiceClientId,
            clientId: req.params.clientId,
            errorMessages: {
                "pkceEnforced-options": "Select yes if you want to enforce PKCE"
            }
        });
    }

    const pkce_enforced = pkceEnforced === "yes";
    // sending flag to Client Register API
    await s4.updateClient(
        nonNull(context.serviceId),
        params.selfServiceClientId,
        params.clientId,
        {pkce_enforced},
        nonNull(session.authenticationResult?.AccessToken)
    );

    req.session.updatedField = "PKCE enforced";
    res.redirect(`/services/${serviceId}/clients`);
};

export const showChangeLandingPageUrlForm: RequestHandler = (req: Request, res: Response): void => {
    res.render("clients/change-landing-page-url.njk", {
        serviceId: req.context.serviceId,
        selfServiceClientId: req.params.selfServiceClientId,
        clientId: req.params.clientId,
        values: {
            landingPageUrl: req.query.landingPageUrl
        }
    });
};

export const processChangeLandingPageUrlForm: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const landingPageUrl = req.body.landingPageUrl;
    const s4: SelfServiceServicesService = req.app.get("backing-service");

    await s4.updateClient(
        nonNull(req.context.serviceId),
        req.params.selfServiceClientId,
        req.params.clientId,
        {landing_page_url: landingPageUrl},
        nonNull(req.session.authenticationResult?.AccessToken)
    );

    if (typeof landingPageUrl === "string" && landingPageUrl.trim().length > 0) {
        req.session.updatedField = "Landing page URI";
    }

    res.redirect(`/services/${req.context.serviceId}/clients`);
};
