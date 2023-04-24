import {NextFunction, Request, Response} from "express";
import {Session, SessionData} from "express-session";
import "../../../src/lib/utils/optional";
import {mobileSecurityCodeValidator} from "../../../src/middleware/validators/mobileOtpValidator";
import "../../../src/types/session";

describe("It checks whether a mobile security code is valid and behaves accordingly", () => {
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

    it("calls the NextFunction if the security code is valid", () => {
        mockRequest.body.securityCode = "123456";
        mobileSecurityCodeValidator("/get-another-message")(mockRequest as Request, mockResponse as Response, nextFunction);
        expect(nextFunction).toHaveBeenCalled();
    });

    it("renders check your phone page with the correct values if the security code is not valid", () => {
        mockSession.emailAddress = "render-this@test.gov.uk";
        mockRequest.body.securityCode = "123";
        mockResponse = {
            render: jest.fn()
        };

        mobileSecurityCodeValidator("/get-another-message", false)(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(mockResponse.render).toHaveBeenCalledWith("common/enter-text-code.njk", {
            errorMessages: {
                securityCode: "Enter the security code using only 6 digits"
            },
            values: {
                securityCode: "123",
                mobileNumber: "07000000000",
                textMessageNotReceivedUrl: "/get-another-message"
            }
        });
    });
});
