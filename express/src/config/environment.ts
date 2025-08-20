export const port = process.env.PORT ?? 3000;
export const useStubApi = process.env.STUB_API == "true";
export const showTestBanner = process.env.TEST_BANNER == "true";
export const googleTagId = process.env.GOOGLE_TAG_ID;
export const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION;

export const allowedEmailDomainsSource = process.env.ALLOWED_EMAIL_DOMAINS_SOURCE || "allowed-test-domains";
export const sessionSecret = process.env.SESSION_SECRET;

export const cognito = {
    userPoolId: process.env.COGNITO_USER_POOL_ID,
    clientId: process.env.COGNITO_CLIENT_ID
};

export const api = {
    baseUrl: process.env.API_BASE_URL
};

export const sessionStorage = {
    tableName: process.env.SESSIONS_TABLE
};

export const showServiceUnavailableBanner = process.env.SHOW_SERVICE_UNAVAILABLE_BANNER == "true";
export const serviceUnavailableBannerStartDate =
    process.env.SERVICE_UNAVAILABLE_BANNER_START_DATE == "undefined" ? undefined : process.env.SERVICE_UNAVAILABLE_BANNER_START_DATE;
export const showServiceUnavailablePage = process.env.SHOW_SERVICE_UNAVAILABLE_PAGE == "true";
export const serviceUnavailablePageEndDate =
    process.env.SERVICE_UNAVAILABLE_PAGE_END_DATE == "undefined" ? undefined : process.env.SERVICE_UNAVAILABLE_PAGE_END_DATE;
