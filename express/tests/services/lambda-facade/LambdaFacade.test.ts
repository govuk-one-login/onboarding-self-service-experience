import axios, {AxiosInstance} from "axios";
import LambdaFacade from "../../../src/services/lambda-facade/LambdaFacade";
import {
    TEST_ACCESS_TOKEN,
    TEST_API_BASE_URL,
    TEST_AUTHENTICATION_RESULT,
    TEST_CLIENT_ID,
    TEST_COGNITO_ID,
    TEST_EMAIL,
    TEST_ONBOARDING_TABLE_ITEM,
    TEST_SELF_SERVICE_CLIENT_ID,
    TEST_SERVICE,
    TEST_SERVICE_ID
} from "../../constants";
import AuthenticationResultParser from "../../../src/lib/authentication-result-parser";
import {TxMAEvent} from "../../../src/types/txma-event";

const axiosCreateSpy = jest.spyOn(axios, "create");
const mockPost = jest.fn();
const mockGet = jest.fn();

describe("Lambda Facade class tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        axiosCreateSpy.mockReturnValue({
            post: mockPost,
            get: mockGet
        } as unknown as AxiosInstance);

        jest.spyOn(AuthenticationResultParser, "getEmail").mockReturnValue(TEST_EMAIL);
    });

    it("calls create with the expected values when a Lambda Facade is instantiated", () => {
        new LambdaFacade();
        expect(axiosCreateSpy).toHaveBeenCalledWith({
            baseURL: TEST_API_BASE_URL,
            headers: {
                "Content-Type": "application/json"
            }
        });
    });

    it("calls post with the /put-user route when the putUser method is called", async () => {
        const mockLambdaFacade = new LambdaFacade();

        await mockLambdaFacade.putUser(TEST_ONBOARDING_TABLE_ITEM, TEST_ACCESS_TOKEN);

        expect(mockPost).toHaveBeenCalledWith("/put-user", TEST_ONBOARDING_TABLE_ITEM, {
            headers: {
                Authorization: `Bearer ${TEST_ACCESS_TOKEN}`
            }
        });
    });

    it("POSTs the /new-client endpoint when the generate client method is called", async () => {
        const mockLambdaFacade = new LambdaFacade();

        await mockLambdaFacade.generateClient(TEST_SERVICE, TEST_AUTHENTICATION_RESULT);

        expect(mockPost).toHaveBeenCalledWith("/new-client", JSON.stringify({service: TEST_SERVICE, contactEmail: TEST_EMAIL}), {
            headers: {
                Authorization: `Bearer ${TEST_ACCESS_TOKEN}`
            }
        });
    });

    it("POSTs the /update-client endpoint when the updateClient client method is called", async () => {
        const mockLambdaFacade = new LambdaFacade();
        const mockUpdates = {
            field: "toBeUpdated"
        };
        const mockRequestBody = {
            serviceId: TEST_SERVICE_ID,
            selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
            clientId: TEST_CLIENT_ID,
            updates: mockUpdates
        };

        await mockLambdaFacade.updateClient(TEST_SERVICE_ID, TEST_SELF_SERVICE_CLIENT_ID, TEST_CLIENT_ID, mockUpdates, TEST_ACCESS_TOKEN);
        expect(mockPost).toHaveBeenCalledWith("/update-client", JSON.stringify(mockRequestBody), {
            headers: {
                Authorization: `Bearer ${TEST_ACCESS_TOKEN}`
            }
        });
    });

    it("POSTs the /update-service endpoint when the updateService client method is called", async () => {
        const mockLambdaFacade = new LambdaFacade();
        const mockUpdates = {
            service_name: "toBeUpdated"
        };
        const expectedRequestBody = {
            serviceId: TEST_SERVICE_ID,
            selfServiceClientId: TEST_SELF_SERVICE_CLIENT_ID,
            clientId: TEST_CLIENT_ID,
            updates: mockUpdates
        };

        await mockLambdaFacade.updateService(TEST_SERVICE_ID, TEST_SELF_SERVICE_CLIENT_ID, TEST_CLIENT_ID, mockUpdates, TEST_ACCESS_TOKEN);
        expect(mockPost).toHaveBeenCalledWith("/update-service", JSON.stringify(expectedRequestBody), {
            headers: {
                Authorization: `Bearer ${TEST_ACCESS_TOKEN}`
            }
        });
    });

    it("GETs the /get-service-clients endpoint with the userId as a path parameter when listClients method is called", async () => {
        const mockLambdaFacade = new LambdaFacade();

        await mockLambdaFacade.listClients(TEST_SERVICE_ID, TEST_ACCESS_TOKEN);
        expect(mockGet).toHaveBeenCalledWith("/get-service-clients/123", {headers: {Authorization: `Bearer ${TEST_ACCESS_TOKEN}`}});
    });

    it("POSTs the /update-user endpoint with the provided updates and access token", async () => {
        const mockLambdaFacade = new LambdaFacade();
        const mockUpdates = {
            someField: "updates"
        };

        await mockLambdaFacade.updateUser(TEST_SELF_SERVICE_CLIENT_ID, mockUpdates, TEST_ACCESS_TOKEN);

        expect(mockPost).toHaveBeenCalledWith(
            "/update-user",
            JSON.stringify({
                userId: TEST_SELF_SERVICE_CLIENT_ID,
                updates: mockUpdates
            }),
            {
                headers: {
                    Authorization: `Bearer ${TEST_ACCESS_TOKEN}`
                }
            }
        );
    });

    it("POSTs the /txma-logging endpoint with the message payload", async () => {
        const mockLambdaFacade = new LambdaFacade();
        const mockEvent = {
            event_name: "Hi There"
        } as TxMAEvent;
        mockLambdaFacade.sendTxMALog(mockEvent);

        expect(mockPost).toHaveBeenCalledWith("/txma-logging", mockEvent);
    });

    it("GETs the /get-dynamodb-entries endpoint with the user Email when the getDynamoDBEntries method is called", async () => {
        const mockLambdaFacade = new LambdaFacade();
        await mockLambdaFacade.getDynamoDBEntries(TEST_EMAIL);

        expect(mockGet).toHaveBeenCalledWith(`/get-dynamodb-entries/${TEST_EMAIL}`);
    });

    it("POSTs the /delete-dynamodb-client-entries when the deleteClientEntries method is called", async () => {
        const mockLambdaFacade = new LambdaFacade();
        await mockLambdaFacade.deleteClientEntries(TEST_COGNITO_ID, TEST_SERVICE_ID, TEST_ACCESS_TOKEN);

        expect(mockPost).toHaveBeenCalledWith(
            "/delete-dynamodb-client-entries/",
            JSON.stringify({
                userId: TEST_COGNITO_ID,
                serviceId: TEST_SERVICE_ID
            }),
            {
                headers: {
                    Authorization: `Bearer ${TEST_ACCESS_TOKEN}`
                }
            }
        );
    });

    it("POSTs the /delete-dynamodb-service-entries when the deleteServiceEntries method is called", async () => {
        const mockLambdaFacade = new LambdaFacade();
        await mockLambdaFacade.deleteServiceEntries(TEST_SERVICE_ID, TEST_ACCESS_TOKEN);

        expect(mockPost).toHaveBeenCalledWith(
            "/delete-dynamodb-service-entries/",
            JSON.stringify({
                serviceId: TEST_SERVICE_ID
            }),
            {
                headers: {
                    Authorization: `Bearer ${TEST_ACCESS_TOKEN}`
                }
            }
        );
    });

    it("GETs the /global-sign-out endpoint when the globalSignOut method is called", async () => {
        const mockLambdaFacade = new LambdaFacade();
        await mockLambdaFacade.globalSignOut(TEST_EMAIL);

        expect(mockGet).toHaveBeenCalledWith(`/global-sign-out/${TEST_EMAIL}`);
    });
});
