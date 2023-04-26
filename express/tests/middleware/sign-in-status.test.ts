import {NextFunction, Request, Response} from "express";
import {Session, SessionData} from "express-session";
import setSignInStatus from "middleware/sign-in-status";
import "config/session-data";

describe("Sign-in status is correctly set in res.locals so it can be accessed on any page", () => {
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
        setSignInStatus(mockRequest as Request, mockResponse as Response, nextFunction as NextFunction);
        expect(nextFunction).toBeCalledTimes(1);
        expect(mockResponse.locals?.isSignedIn).toBe(true);
    });

    it("should set res.locals.isSignedIn to false if req.session.isSignedIn is false", () => {
        mockSession.isSignedIn = false;
        setSignInStatus(mockRequest as Request, mockResponse as Response, nextFunction as NextFunction);
        expect(nextFunction).toBeCalledTimes(1);
        expect(mockResponse.locals?.isSignedIn).toBe(false);
    });

    it("should set res.locals.isSignedIn to false if req.session.isSignedIn is undefined", () => {
        setSignInStatus(mockRequest as Request, mockResponse as Response, nextFunction as NextFunction);
        expect(nextFunction).toBeCalledTimes(1);
        expect(mockResponse.locals?.isSignedIn).toBe(false);
    });
});
