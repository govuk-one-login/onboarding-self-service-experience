import {NextFunction, Request, Response} from "express";
import {Session, SessionData} from "express-session";
import {urisValidator} from "../../../src/middleware/validators/urisValidator";

describe("it calls the NextFunction if the URIs are valid or renders an error page if not", () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction;
    let mockSession: Partial<Session & Partial<SessionData>>;

    beforeEach(() => {
        mockRequest = {
            body: jest.fn(),
            session: mockSession as Session,
            params: {
                serviceId: "foo",
                selfServiceClientId: "bar",
                clientId: "baz"
            }
        };

        nextFunction = jest.fn();
        mockResponse = {render: jest.fn()};
    });

    it("works calls the next function with valid URLs", () => {
        mockRequest.body.redirectUris = "https://valid.gov.uk/ https://also-valid.gov.uk";
        urisValidator("some-template.njk")(mockRequest as Request, mockResponse as Response, nextFunction as NextFunction);
        expect(nextFunction).toHaveBeenCalledTimes(1);
        expect(mockResponse.render).toHaveBeenCalledTimes(0);
    });

    it("works calls the render function with invalid URLs", () => {
        mockRequest.body.redirectUris = "http://invalid.gov.uk/ http://also-invalid.gov.uk";
        urisValidator("some-template.njk")(mockRequest as Request, mockResponse as Response, nextFunction as NextFunction);
        expect(nextFunction).toHaveBeenCalledTimes(0);
        expect(mockResponse.render).toHaveBeenCalledTimes(1);
    });
});
