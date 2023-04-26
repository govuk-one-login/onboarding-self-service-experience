import {NextFunction, Request, Response} from "express";
import {Session, SessionData} from "express-session";
import checkAuthorisation from "middleware/authoriser";
import "config/session-data";

describe("test authoriser", () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction;

    const mockSession: Partial<Session & Partial<SessionData>> = {};

    beforeEach(() => {
        mockRequest = {
            body: jest.fn(),
            session: mockSession as Session
        };

        mockResponse = {};
        mockResponse.render = jest.fn();
        mockResponse.redirect = jest.fn();
        nextFunction = jest.fn();
    });

    it("should redirect to /session-timeout when there is no access token", async function () {
        mockRequest.body.render = "account/change-password.njk";
        await checkAuthorisation(mockRequest as Request, mockResponse as Response, nextFunction as NextFunction);
        expect(nextFunction).toBeCalledTimes(0);
        expect(mockResponse.redirect).toHaveBeenCalledWith("/session-timeout");
    });
});
