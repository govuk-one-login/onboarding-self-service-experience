import {AttributeValue} from "@aws-sdk/client-dynamodb";

export const TEST_USER_ID = "1ded3d65-d088-4319-9431-ea5a3323799d";
export const TEST_USER_DYNAMO_ID = "0e5033d3-91bf-4cdc-95de-7655e85b6bb4";
export const TEST_USER_EMAIL = "test@test.gov.uk";
export const TEST_USER_FIRST_NAME = "Jane";
export const TEST_USER_LAST_NAME = "Jones";
export const TEST_USER_FULL_NAME = "Jones";
export const TEST_PASSWORD_LAST_UPDATED_DATE = "01/01/2024";
export const TEST_USER_PHONE_NUMBER = "12345678910";
export const TEST_CLIENT_ID = "rgCBoiWHehrb4r";
export const TEST_SERVICE_NAME = "TEST_SERVICE";
export const TEST_USER_CONFIG: Record<string, AttributeValue> = {
    userId: {S: TEST_USER_ID},
    fullName: {S: TEST_USER_FULL_NAME},
    firstName: {S: TEST_USER_FIRST_NAME},
    lastName: {S: TEST_USER_LAST_NAME},
    email: {S: TEST_USER_EMAIL},
    mobileNumber: {S: TEST_USER_PHONE_NUMBER},
    passwordLastUpdated: {S: TEST_PASSWORD_LAST_UPDATED_DATE}
};
export const TEST_COGNITO_USER_ID = "e20b814d-55b1-4e68-a28d-3a0c4818adfa";
export const TEST_SERVICE_ID = "488c26e5-6147-4b8e-be05-031e00310fdb";
export const TEST_DEFAULT_PUBLIC_KEY =
    "MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEAp2mLkQGo24Kz1rut0oZlviMkGomlQCH+iT1pFvegZFXq39NPjRWyatmXp/XIUPqCq9Kk8/+tq4Sgjw+EM5tATJ06j5r+35of58ATGVPniW//IhGizrv6/ebGcGEUJ0Y/ZmlCHYPV+lbewpttQ/IYKM1nr3k/Rl6qepbVYe+MpGubluQvdhgUYel9OzxiOvUk7XI0axPquiXzoEgmNNOai8+WhYTkBqE3/OucAv+XwXdnx4XHmKzMwTv93dYMpUmvTxWcSeEJ/4/SrbiK4PyHWVKU2BozfSUejVNhahAzZeyyDwhYJmhBaZi/3eOOlqGXj9UdkOXbl3vcwBH8wD30O9/4F5ERLKxzOaMnKZ+RpnygWF0qFhf+UeFMy+O06sdgiaFnXaSCsIy/SohspkKiLjNnhvrDNmPLMQbQKQlJdcp6zUzI7Gzys7luEmOxyMpA32lDBQcjL7KNwM15s4ytfrJ46XEPZUXESce2gj6NazcPPsrTa/Q2+oLS9GWupGh7AgMBAAE=";

export const TEST_DATA_TABLE_ITEM = {
    service_name: {
        S: "My test service 3"
    },
    post_logout_redirect_uris: {
        L: [
            {
                S: "http://localhost/home/root"
            }
        ]
    },
    subject_type: {
        S: "pairwise"
    },
    contacts: {
        L: [
            {
                S: TEST_USER_EMAIL
            },
            {
                S: "onboarding@digital.cabinet-office.gov.uk"
            }
        ]
    },
    public_key: {
        S: TEST_DEFAULT_PUBLIC_KEY
    },
    client_name: {
        S: "integration"
    },
    scopes: {
        L: [
            {
                S: "openid"
            },
            {
                S: "email"
            },
            {
                S: "phone"
            }
        ]
    },
    clientId: {
        S: TEST_COGNITO_USER_ID
    },
    default_fields: {
        L: [
            {
                S: "data"
            },
            {
                S: "public_key"
            },
            {
                S: "redirect_uris"
            },
            {
                S: "scopes"
            },
            {
                S: "post_logout_redirect_uris"
            },
            {
                S: "subject_type"
            },
            {
                S: "service_type"
            }
        ]
    },
    redirect_uris: {
        L: [
            {
                S: "http://localhost/"
            }
        ]
    },
    sk: {
        S: TEST_CLIENT_ID
    },
    pk: {
        S: TEST_SERVICE_ID
    },
    service_type: {
        S: "MANDATORY"
    },
    type: {
        S: "integration"
    }
};
