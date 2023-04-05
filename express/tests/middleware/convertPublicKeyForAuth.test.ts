import {NextFunction, Request, Response} from "express";
import {Session, SessionData} from "express-session";
import {convertPublicKeyForAuth} from "middleware/convertPublicKeyForAuth";
import {VALID_PUBLIC_KEY_NO_HEADERS_OR_LINE_BREAKS, VALID_PUBLIC_KEY_WITH_HEADERS} from "../lib/publicKeyUtils.test";

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

    it.skip("converts valid user input into a form Auth can handle", () => {
        mockRequest.body.serviceUserPublicKey = VALID_PUBLIC_KEY_WITH_HEADERS;
        convertPublicKeyForAuth(mockRequest as Request, mockResponse as Response, nextFunction as NextFunction);
        expect(mockRequest.body.authCompliantPublicKey).toEqual(VALID_PUBLIC_KEY_NO_HEADERS_OR_LINE_BREAKS);
    });
});
