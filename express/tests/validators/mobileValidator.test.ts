import validateMobileNumber from "../../src/middleware/validators/mobileValidator";
import {Request, Response, NextFunction} from "express";
import {Session} from "express-session";

const INTERNATIONAL_PREFIX = "+44";
const UK_PREFIX = "0";
const NETWORK_CODE = "7700";
const FIRST_THREE_DIGITS = "900";
const LAST_THREE_DIGITS = "123";

const VALID_NUMBERS = [
    `${INTERNATIONAL_PREFIX}${NETWORK_CODE}${FIRST_THREE_DIGITS}${LAST_THREE_DIGITS}`,
    `${INTERNATIONAL_PREFIX}${NETWORK_CODE} ${FIRST_THREE_DIGITS} ${LAST_THREE_DIGITS}`,
    `${INTERNATIONAL_PREFIX}${NETWORK_CODE}-${FIRST_THREE_DIGITS}-${LAST_THREE_DIGITS}`,
    `${UK_PREFIX}${NETWORK_CODE}${FIRST_THREE_DIGITS}${LAST_THREE_DIGITS}`,
    `${UK_PREFIX}${NETWORK_CODE} ${FIRST_THREE_DIGITS} ${LAST_THREE_DIGITS}`,
    `${UK_PREFIX}${NETWORK_CODE}-${FIRST_THREE_DIGITS}-${LAST_THREE_DIGITS}`,
    `(${UK_PREFIX}${NETWORK_CODE})${FIRST_THREE_DIGITS}${LAST_THREE_DIGITS}`,
    `(${UK_PREFIX}${NETWORK_CODE}) ${FIRST_THREE_DIGITS} ${LAST_THREE_DIGITS}`,
    `(${UK_PREFIX}${NETWORK_CODE}) ${FIRST_THREE_DIGITS}-${LAST_THREE_DIGITS}`
];

const INVALID_NUMBERS = [
    "0115 496 0000",
    "0700000000",
    "+447000000000",
    `${INTERNATIONAL_PREFIX}${NETWORK_CODE}${FIRST_THREE_DIGITS}`,
    `${INTERNATIONAL_PREFIX}${NETWORK_CODE}${FIRST_THREE_DIGITS}${FIRST_THREE_DIGITS}${FIRST_THREE_DIGITS}`
];

describe("Validating numbers works as expected", () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction;

    it.each(VALID_NUMBERS)("Accepts valid number %s", validNumber => {
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

        mockRequest = {
            body: jest.fn(),
            session: session
        };

        mockResponse = {};
        nextFunction = jest.fn();

        mockRequest.body.mobileNumber = validNumber;
        validateMobileNumber("./any-template.njk")(mockRequest as Request, mockResponse as Response, nextFunction as NextFunction);
        expect(nextFunction).toBeCalledTimes(1);
    });

    it.each(INVALID_NUMBERS)("Rejects invalid number %s", invalidNumber => {
        mockRequest = {
            body: jest.fn()
        };

        mockResponse = {
            render: jest.fn()
        };

        nextFunction = jest.fn();

        mockRequest.body.mobileNumber = invalidNumber;
        validateMobileNumber("./any-template.njk")(mockRequest as Request, mockResponse as Response, nextFunction as NextFunction);
        expect(nextFunction).not.toBeCalled();
        expect(mockResponse.render).toHaveBeenCalledTimes(1);
    });
});
