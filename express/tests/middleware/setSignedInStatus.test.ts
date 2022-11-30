import {AuthenticationResultType} from "@aws-sdk/client-cognito-identity-provider";
import {NextFunction, Request, Response} from "express";
import {Session, SessionData} from "express-session";
import setSignedInStatus from "../../src/middleware/setSignedInStatus";
import {MfaResponse} from "../../src/services/self-service-services-service";

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

describe("setSignedInStatus is correctly set in res.locals so that any page that is rendered can tell whether the user is signedIn and display the correct contextual information", () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction;

    const mockSession: Partial<Session & Partial<SessionData>> = {};
    const locals: Record<string, boolean> = {isLoggedIn: true};

    beforeEach(() => {
        mockRequest = {
            body: jest.fn(),
            session: mockSession as Session
        };

        mockResponse = {locals: locals};
        mockResponse.render = jest.fn();
        mockResponse.redirect = jest.fn();
        nextFunction = jest.fn();
    });

    it("should set res.locals.isSignedIn to true if req.session.isSignedIn is true", () => {
        mockSession.isSignedIn = true;
        setSignedInStatus(mockRequest as Request, mockResponse as Response, nextFunction as NextFunction);
        expect(nextFunction).toBeCalledTimes(1);
        expect(mockResponse.locals?.isSignedIn).toBe(true);
    });

    it("should set res.locals.isSignedIn to false if req.session.isSignedIn is false", () => {
        mockSession.isSignedIn = false;
        setSignedInStatus(mockRequest as Request, mockResponse as Response, nextFunction as NextFunction);
        expect(nextFunction).toBeCalledTimes(1);
        expect(mockResponse.locals?.isSignedIn).toBe(false);
    });

    it("should set res.locals.isSignedIn to false if req.session.isSignedIn is undefined", () => {
        setSignedInStatus(mockRequest as Request, mockResponse as Response, nextFunction as NextFunction);
        expect(nextFunction).toBeCalledTimes(1);
        expect(mockResponse.locals?.isSignedIn).toBe(false);
    });
});
