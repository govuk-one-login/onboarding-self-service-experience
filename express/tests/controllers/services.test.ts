import AuthenticationResultParser from "../../src/lib/authentication-result-parser";
import {request, response} from "../mocks";
import {TEST_AUTHENTICATION_RESULT, TEST_COGNITO_ID, TEST_SERVICE} from "../constants";
import {listServices} from "../../src/controllers/services";
import SelfServiceServicesService from "../../src/services/self-service-services-service";

describe("listServices controller tests", () => {
    const getCognitoIdSpy = jest.spyOn(AuthenticationResultParser, "getCognitoId");
    const listServicesSpy = jest.spyOn(SelfServiceServicesService.prototype, "listServices");

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders the there-is-a-problem template when there is no userId returned from the authentication result parser", async () => {
        getCognitoIdSpy.mockReturnValue("");
        const mockReq = request({
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT
            }
        });
        const mockRes = response();
        await listServices(mockReq, mockRes, jest.fn());
        expect(getCognitoIdSpy).toHaveBeenCalledWith(TEST_AUTHENTICATION_RESULT);
        expect(mockRes.render).toHaveBeenCalledWith("there-is-a-problem.njk");
    });

    it("calls s4 list services with the userId and redirects to `/register/create-service` when no services are returned", async () => {
        getCognitoIdSpy.mockReturnValue(TEST_COGNITO_ID);
        listServicesSpy.mockResolvedValue([]);

        const mockReq = request({
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT
            }
        });
        const mockRes = response();
        await listServices(mockReq, mockRes, jest.fn());
        expect(getCognitoIdSpy).toHaveBeenCalledWith(TEST_AUTHENTICATION_RESULT);
        expect(listServicesSpy).toHaveBeenCalledWith(TEST_COGNITO_ID, TEST_AUTHENTICATION_RESULT.AccessToken);
        expect(mockRes.redirect).toHaveBeenCalledWith("/register/create-service");
    });
    it("calls s4 list services with the userId and renders the `services/services.njk` template with the services present", async () => {
        getCognitoIdSpy.mockReturnValue(TEST_COGNITO_ID);
        listServicesSpy.mockResolvedValue([TEST_SERVICE]);

        const mockReq = request({
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT
            }
        });
        const mockRes = response();
        await listServices(mockReq, mockRes, jest.fn());
        expect(getCognitoIdSpy).toHaveBeenCalledWith(TEST_AUTHENTICATION_RESULT);
        expect(listServicesSpy).toHaveBeenCalledWith(TEST_COGNITO_ID, TEST_AUTHENTICATION_RESULT.AccessToken);
        expect(mockRes.render).toHaveBeenCalledWith("services/services.njk", {services: [TEST_SERVICE]});
    });
});
