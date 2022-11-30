import {NextFunction, Request, Response} from "express";
import notOnCommonPasswordListValidator from "../../../src/middleware/validators/notOnCommonPasswordListValidator";

describe("it will not allow a user to submit a common password but will allow one not on the list", () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction;

    beforeEach(() => {
        mockRequest = {
            body: jest.fn()
        };

        mockResponse = {render: jest.fn()};
        nextFunction = jest.fn();
    });

    it("doesn't allow password as a password", async () => {
        mockRequest.body.password = "password";

        await notOnCommonPasswordListValidator("template.njk", "password", [])(
            mockRequest as Request,
            mockResponse as Response,
            nextFunction as NextFunction
        );

        expect(nextFunction).toHaveBeenCalledTimes(0);
    });

    it("allows somerandomtestvalue as a password", async () => {
        mockRequest.body.password = "somerandomtestvalue";

        await notOnCommonPasswordListValidator("template.njk", "password", [])(
            mockRequest as Request,
            mockResponse as Response,
            nextFunction as NextFunction
        );

        expect(nextFunction).toHaveBeenCalledTimes(1);
    });
});
