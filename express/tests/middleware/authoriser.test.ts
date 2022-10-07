import {NextFunction, Request, Response} from "express";
import {checkAuthorisation} from "../../src/middleware/authoriser";
import {Session} from "express-session";

describe("test authoriser", () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction;
    const session: Session = {
        id: "",
        cookie: {originalMaxAge: 0},
        regenerate(callback: (err: any) => void): Session {
            return this;
        },
        destroy(callback: (err: any) => void): Session {
            return this;
        },
        reload(callback: (err: any) => void): Session {
            return this;
        },
        resetMaxAge(): Session {
            return this;
        },
        save(callback?: (err: any) => void): Session {
            return this;
        },
        touch(): Session {
            return this;
        }
    };

    beforeEach(() => {
        mockRequest = {
            body: jest.fn(),
            session: session
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
