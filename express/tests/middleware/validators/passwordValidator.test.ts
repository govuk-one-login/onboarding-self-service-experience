import {NextFunction, Request, Response} from "express";
import {passwordValidator} from "../../../src/middleware/validators/passwordValidator";

describe("passwords of 8 or more characters are allowed, passwords with less characters are rejected", () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction;

    beforeEach(() => {
        mockRequest = {
            body: jest.fn()
        };

        mockResponse = {
            render: jest.fn()
        };

        nextFunction = jest.fn();
    });

    it("allows a 12 character password", () => {
        mockRequest.body.password = "12_character";
        passwordValidator("some-template.njk")(mockRequest as Request, mockResponse as Response, nextFunction as NextFunction);
        expect(nextFunction).toHaveBeenCalledTimes(1);
        expect(mockResponse.render).toHaveBeenCalledTimes(0);
    });

    it("rejects a 7 character password", () => {
        mockRequest.body.password = "7_chars";
        passwordValidator("some-template.njk")(mockRequest as Request, mockResponse as Response, nextFunction as NextFunction);
        expect(nextFunction).toHaveBeenCalledTimes(0);
        expect(mockResponse.render).toHaveBeenCalledTimes(1);
    });
});
