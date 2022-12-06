import {AuthenticationResultType} from "@aws-sdk/client-cognito-identity-provider";
import {NextFunction, Request, Response} from "express";
import {Session, SessionData} from "express-session";
import {mobileOtpValidator} from "../../../src/middleware/validators/mobileOtpValidator";
import {MfaResponse} from "../../../src/services/self-service-services-service";

declare module "express-session" {
    interface SessionData {
        emailAddress: string;
        mobileNumber: string;
        enteredMobileNumber: string;
        cognitoSession: string;
        authenticationResult: AuthenticationResultType;
        mfaResponse: MfaResponse;
        updatedField: string;
        isSignedIn: boolean;
    }
}

describe("It checks whether an mobile OTP is valid and behaves accordingly", () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction;
    let mockSession: Partial<Session & Partial<SessionData>>;

    beforeEach(() => {
        mockSession = {enteredMobileNumber: "07000000000"};
        mockRequest = {
            body: jest.fn(),
            session: mockSession as Session
        };

        nextFunction = jest.fn();
        mockResponse = {render: jest.fn()};
    });

    it("calls the NextFunction if the OTP is valid", () => {
        mockRequest.body["sms-otp"] = "123456";
        mobileOtpValidator("template.njk", "/get-another-message", false)(mockRequest as Request, mockResponse as Response, nextFunction);
        expect(nextFunction).toHaveBeenCalled();
    });

    it("renders check-mobile.njk with the correct values if the OTP is not valid", () => {
        mockSession.emailAddress = "render-this@test.gov.uk";
        mockRequest.body["sms-otp"] = "123";
        mockResponse = {
            render: jest.fn()
        };

        mobileOtpValidator("/sms", "/get-another-message", false)(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(mockResponse.render).toHaveBeenCalledWith("check-mobile.njk", {
            errorMessages: {
                "sms-otp": "Enter the security code using only 6 digits"
            },
            values: {
                "sms-otp": "123",
                mobileNumber: "07000000000",
                formActionUrl: "/sms",
                textMessageNotReceivedUrl: "/get-another-message"
            }
        });
    });
});
