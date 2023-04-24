import {NextFunction, Request, Response} from "express";
import {Session, SessionData} from "express-session";
import {emailSecurityCodeValidator} from "../../../src/middleware/validators/emailOtpValidator";
import "../../../src/types/session";

describe("It checks whether an email security code is valid and behaves accordingly", () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction;
    let mockSession: Partial<Session & Partial<SessionData>>;

    beforeEach(() => {
        mockSession = {};
        mockRequest = {
            body: jest.fn(),
            session: mockSession as Session
        };

        nextFunction = jest.fn();
        mockResponse = {render: jest.fn()};
    });

    it("calls the NextFunction if the security code is valid", () => {
        mockRequest.body.securityCode = "123456";
        emailSecurityCodeValidator(mockRequest as Request, mockResponse as Response, nextFunction);
        expect(nextFunction).toHaveBeenCalled();
    });

    it("renders check your email page with the correct values if the security code is not valid", () => {
        mockSession.emailAddress = "render-this@test.gov.uk";
        mockRequest.body.securityCode = "123";
        mockResponse = {
            render: jest.fn()
        };

        emailSecurityCodeValidator(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(mockResponse.render).toHaveBeenCalledWith("register/enter-email-code.njk", {
            values: {
                emailAddress: "render-this@test.gov.uk",
                securityCode: "123"
            },
            errorMessages: {
                securityCode: "Enter the security code using only 6 digits"
            }
        });
    });
});
