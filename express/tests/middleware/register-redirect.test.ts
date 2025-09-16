import SelfServiceServicesService from "../../src/services/self-service-services-service";
import checkRegisterRedirect from "../../src/middleware/register-state-machine";
import {request, response} from "../mocks";
import {TEST_AUTHENTICATION_RESULT, TEST_EMAIL} from "../constants";
import {SignupStatus} from "../../src/lib/utils/signup-status";
import {AdminInitiateAuthCommandOutput} from "@aws-sdk/client-cognito-identity-provider";

const mockNext = jest.fn();
const mockRes = response();
const s4SignUpStatusSpy = jest.spyOn(SelfServiceServicesService.prototype, "getSignUpStatus");
const s4RefreshTokenSpy = jest.spyOn(SelfServiceServicesService.prototype, "useRefreshToken");

describe("Verify access token in the session", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it("Redirect based on SignUpStatus", async () => {
        const refreshTokenResponse: AdminInitiateAuthCommandOutput = {
            $metadata: {httpStatusCode: 200},
            AuthenticationResult: TEST_AUTHENTICATION_RESULT
        };
        s4SignUpStatusSpy.mockResolvedValue(new SignupStatus());
        s4RefreshTokenSpy.mockResolvedValue(refreshTokenResponse);

        const mockReq = request({
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT,
                emailAddress: TEST_EMAIL
            }
        });

        console.log(mockReq);

        await checkRegisterRedirect(mockReq, mockRes, mockNext);
        expect(s4SignUpStatusSpy).toHaveBeenCalledWith(TEST_EMAIL);
        expect(mockRes.redirect).toHaveBeenCalledWith("/register/resume-before-password");
    });
});
