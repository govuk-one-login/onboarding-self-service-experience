import {RequestHandler} from "express";
import getAuthApiCompliantPublicKey from "../lib/public-key";
import SelfServiceServicesService from "../services/self-service-services-service";

const defaultPublicKey =
    "MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEAp2mLkQGo24Kz1rut0oZlviMkGomlQCH+iT1pFvegZFXq39NPjRWyatmXp/XIUPqCq9Kk8/+tq4Sgjw+EM5tATJ06j5r+35of58ATGVPniW//IhGizrv6/ebGcGEUJ0Y/ZmlCHYPV+lbewpttQ/IYKM1nr3k/Rl6qepbVYe+MpGubluQvdhgUYel9OzxiOvUk7XI0axPquiXzoEgmNNOai8+WhYTkBqE3/OucAv+XwXdnx4XHmKzMwTv93dYMpUmvTxWcSeEJ/4/SrbiK4PyHWVKU2BozfSUejVNhahAzZeyyDwhYJmhBaZi/3eOOlqGXj9UdkOXbl3vcwBH8wD30O9/4F5ERLKxzOaMnKZ+RpnygWF0qFhf+UeFMy+O06sdgiaFnXaSCsIy/SohspkKiLjNnhvrDNmPLMQbQKQlJdcp6zUzI7Gzys7luEmOxyMpA32lDBQcjL7KNwM15s4ytfrJ46XEPZUXESce2gj6NazcPPsrTa/Q2+oLS9GWupGh7AgMBAAE=";

export const showClient: RequestHandler = async (req, res) => {
    // TODO make S4 instances static in all controllers
    const serviceId = req.context.serviceId;
    const s4: SelfServiceServicesService = req.app.get("backing-service");
    const client = (await s4.listClients(nonNull(serviceId), nonNull(req.session.authenticationResult?.AccessToken)))[0];
    const selfServiceClientId = client.dynamoServiceId;
    const authClientId = client.authClientId;
    const serviceName = client.serviceName;
    const redirectUrls = String(client.redirectUris).split(",");
    const userPublicKey = client.publicKey == defaultPublicKey ? "" : getAuthApiCompliantPublicKey(client.publicKey);

    res.render("clients/client-details.njk", {
        clientId: authClientId,
        selfServiceClientId: selfServiceClientId,
        serviceId: serviceId,
        serviceName: serviceName,
        updatedField: req.session.updatedField,
        redirectUrls: redirectUrls,
        userAttributesRequired: client.scopes.join(", "),
        userPublicKey: userPublicKey,
        postLogoutRedirectUrls: client.postLogoutUris.join(" "),
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

export const showPrivateBetaForm: RequestHandler = async (req, res) => {
    res.render("clients/private-beta.njk", {
        serviceId: req.context.serviceId,
        selfServiceClientId: req.params.selfServiceClientId,
        clientId: req.params.clientId,
        serviceName: req.session.serviceName,
        emailAddress: req.session.emailAddress
    });
};

export const processPrivateBetaForm: RequestHandler = async (req, res) => {
    const userName = req.body.userName;
    const department = req.body.department;
    const serviceName = req.body.serviceName;
    const emailAddress = req.session.emailAddress;
    const serviceId = req.context.serviceId;
    const selfServiceClientId = req.params.selfServiceClientId;
    const clientId = req.params.clientId;
    const errorMessages = new Map<string, string>();

    if (userName === "") {
        errorMessages.set("userName", "Enter your name");
    }

    if (department === "") {
        errorMessages.set("department", "Enter your department");
    }

    if (errorMessages.size > 0) {
        res.render("clients/private-beta.njk", {
            serviceId: serviceId,
            selfServiceClientId: selfServiceClientId,
            clientId: clientId,
            serviceName: serviceName,
            emailAddress: emailAddress,
            errorMessages: Object.fromEntries(errorMessages),
            values: {
                userName: userName,
                department: department
            }
        });

        return;
    }

    const s4: SelfServiceServicesService = req.app.get("backing-service");
    await s4.privateBetaRequest(
        userName,
        department,
        serviceName,
        emailAddress as string,
        nonNull(req.session.authenticationResult?.AccessToken)
    );

    res.redirect(`/services/${serviceId}/clients/${clientId}/${selfServiceClientId}/private-beta/submitted`);
};

export const showPrivateBetaFormSubmitted: RequestHandler = async (req, res) => {
    res.render("clients/private-beta-form-submitted.njk", {
        serviceId: req.context.serviceId,
        selfServiceClientId: req.params.selfServiceClientId,
        clientId: req.params.clientId
    });
};

export const showProcessChangeServiceNameForm: RequestHandler = async (req, res) => {
    res.render("clients/change-service-name.njk", {
        serviceId: req.context.serviceId,
        values: {
            serviceName: req.query.serviceName
        }
    });
};

export const processChangeServiceNameForm: RequestHandler = async (req, res) => {
    const newServiceName = req.body.serviceName;
    const serviceId = req.context.serviceId;

    if (newServiceName === "") {
        res.render("clients/change-service-name.njk", {
            serviceId: serviceId,
            errorMessages: {
                serviceName: "Enter your service name"
            }
        });

        return;
    }

    const selfServiceClientId = req.params.selfServiceClientId;
    const clientId = req.params.clientId;
    const s4: SelfServiceServicesService = req.app.get("backing-service");

    // TODO service_name is the db layer leaking into the domain
    // TODO is this correct? Don't we also need to update the pk:service sk:service entry? We need an updateService call
    await s4.updateClient(
        nonNull(serviceId),
        selfServiceClientId,
        clientId,
        {service_name: newServiceName},
        nonNull(req.session.authenticationResult?.AccessToken)
    );

    req.session.updatedField = "service name";
    req.session.serviceName = newServiceName;
    res.redirect(`/services/${serviceId}/clients`);
};

export const showProcessChangePublicKeyForm: RequestHandler = async (req, res) => {
    res.render("clients/change-public-key.njk", {
        serviceId: req.context.serviceId,
        selfServiceClientId: req.params.selfServiceClientId,
        clientId: req.params.clientId,
        serviceUserPublicKey: req.query.publicKey
    });
};

export const processChangePublicKeyForm: RequestHandler = async (req, res) => {
    const publicKey = req.body.authCompliantPublicKey;
    const s4: SelfServiceServicesService = req.app.get("backing-service");

    await s4.updateClient(
        nonNull(req.context.serviceId),
        req.params.selfServiceClientId,
        req.params.clientId,
        {public_key: publicKey},
        nonNull(req.session.authenticationResult?.AccessToken)
    );

    req.session.updatedField = "public key";
    res.redirect(`/services/${req.context.serviceId}/clients`);
};

export const showProcessChangeRedirectUrlsForm: RequestHandler = async (req, res) => {
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

    await s4.updateClient(
        nonNull(req.context.serviceId),
        req.params.selfServiceClientId,
        req.params.clientId,
        {redirect_uris: redirectUris},
        nonNull(req.session.authenticationResult?.AccessToken)
    );

    req.session.updatedField = "redirect URIs";
    res.redirect(`/services/${req.context.serviceId}/clients`);
};

export const showProcessChangeUserAttributesForm: RequestHandler = async (req, res) => {
    const userAttributes = nonNull(req.query.userAttributes?.toString()).split(" ");
    const email: boolean = userAttributes.includes("email");
    const phone: boolean = userAttributes.includes("phone");
    const offline_access: boolean = userAttributes.includes("offline_access");

    res.render("clients/change-user-attributes.njk", {
        email: email,
        phone: phone,
        offline_access: offline_access,
        serviceId: req.context.serviceId,
        selfServiceClientId: req.params.selfServiceClientId,
        clientId: req.params.clientId
    });
};

export const processChangeUserAttributesForm: RequestHandler = async (req, res) => {
    const s4: SelfServiceServicesService = req.app.get("backing-service");
    const attributes: string[] = ["openid"];

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

export const showProcessChangePostLogoutUrisForm: RequestHandler = async (req, res) => {
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

    await s4.updateClient(
        nonNull(req.context.serviceId),
        req.params.selfServiceClientId,
        req.params.clientId,
        {post_logout_redirect_uris: postLogoutUris},
        nonNull(req.session.authenticationResult?.AccessToken)
    );

    req.session.updatedField = "post-logout redirect URIs";
    res.redirect(`/services/${req.context.serviceId}/clients`);
};
