import {NextFunction, Request, Response} from "express";
import {Session, SessionData} from "express-session";
import convertPublicKeyForAuth from "middleware/convert-public-key";
import {publicKeyCompact, publicKeyWithHeaders} from "../lib/public-key.test";

describe("It correctly handles user input", () => {
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
    });

    it("converts valid user input into a form Auth can handle", () => {
        mockRequest.body.serviceUserPublicKey = publicKeyWithHeaders;
        convertPublicKeyForAuth(mockRequest as Request, mockResponse as Response, nextFunction as NextFunction);
        expect(mockRequest.body.authCompliantPublicKey).toEqual(publicKeyCompact);
    });
});
