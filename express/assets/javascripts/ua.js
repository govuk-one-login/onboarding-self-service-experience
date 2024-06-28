if (window) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    /* global window document ga */
    window.DI = window.DI || {};
    window.DI.analyticsUa = window.DI.analyticsUa || {};
}

(function (analytics) {
    "use strict";

    const init = function () {
        const consentGiven = window.DI.analyticsGa4.cookie.hasConsentForAnalytics();
        if (consentGiven) {
            window.DI.analyticsGa4.loadGtmScript(window.DI.analyticsGa4.uaContainerId);
        } else {
            window.addEventListener("cookie-consent", window.DI.analyticsUa.init);
        }
    };
    analytics.init = init;
})(window.DI.analyticsUa);
