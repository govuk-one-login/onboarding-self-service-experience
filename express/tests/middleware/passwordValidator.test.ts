import {NextFunction, Request, Response} from "express";
import {passwordValidator} from "../../src/middleware/passwordValidator";

const PASSWORD_WITH_EMPTY_VALUE = "";
const PASSWORD_LESS_THAN_8_CHAR = "123";
const PASSWORD_8_CHAR = "12345678";
const PASSWORD_9_CHAR = "123456789";

describe("Checking that the user has entered a valid password", () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction;

    beforeEach(() => {
        mockRequest = {
            body: jest.fn()
        };
        mockResponse = {};
        mockResponse.render = jest.fn();
        nextFunction = jest.fn();
    });

    it('a valid "12345678" 8 character password is accepted. ', async function () {
        mockRequest.body.password = PASSWORD_8_CHAR;
        passwordValidator("create-account/new-password.njk", false)(
            mockRequest as Request,
            mockResponse as Response,
            nextFunction as NextFunction
        );
        expect(nextFunction).toBeCalledTimes(1);
    });

    it('a valid "123456789" more than 8 character password is accepted. ', async function () {
        mockRequest.body.password = PASSWORD_9_CHAR;
        passwordValidator("create-account/new-password.njk", false)(
            mockRequest as Request,
            mockResponse as Response,
            nextFunction as NextFunction
        );
        expect(nextFunction).toBeCalledTimes(1);
    });

    it("a password with less than 8 characters is not accepted. ", async function () {
        mockRequest.body.password = PASSWORD_LESS_THAN_8_CHAR;
        passwordValidator("create-account/new-password.njk", false)(
            mockRequest as Request,
            mockResponse as Response,
            nextFunction as NextFunction
        );
        expect(nextFunction).toBeCalledTimes(0);
        expect(mockResponse.render).toHaveBeenCalledWith("create-account/new-password.njk", {
            errorMessages: {password: "Your password must be 8 characters or more"},
            values: {password: PASSWORD_LESS_THAN_8_CHAR}
        });
    });

    it("a password with empty value is not accepted. ", async function () {
        mockRequest.body.password = PASSWORD_WITH_EMPTY_VALUE;
        passwordValidator("create-account/new-password.njk", false)(
            mockRequest as Request,
            mockResponse as Response,
            nextFunction as NextFunction
        );
        expect(nextFunction).toBeCalledTimes(0);
        expect(mockResponse.render).toHaveBeenCalledWith("create-account/new-password.njk", {
            errorMessages: {password: "Enter a password"}
        });
    });
});
