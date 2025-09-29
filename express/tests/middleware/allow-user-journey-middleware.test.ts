import {NextFunction} from "express";
import {allowUserJourneyMiddleware} from "../../src/middleware/allow-user-journey-middleware";
import {request, response} from "../mocks";
import {RegisterRoutes} from "../../src/middleware/state-machine";

describe("Allow user journey middleware", () => {
    it("Should call next when use journey is valid", () => {
        const req = request({
            path: "/too-many-codes",
            baseUrl: "/register",
            session: {
                nextPaths: [RegisterRoutes.resendEmailCode, RegisterRoutes.createPassword, RegisterRoutes.tooManyCodes]
            }
        });
        const res = response();
        const nextFunction: NextFunction = jest.fn();

        allowUserJourneyMiddleware(req, res, nextFunction);

        expect(res.redirect).not.toHaveBeenCalled();
        expect(nextFunction).toHaveBeenCalled();
    });

    it("Should redirect to /page-unavailable when invalid user journey", () => {
        const req = request({
            path: "/invalid-path",
            baseUrl: "/register",
            session: {
                nextPaths: [RegisterRoutes.resendEmailCode, RegisterRoutes.createPassword, RegisterRoutes.tooManyCodes]
            }
        });
        const res = response();
        const nextFunction: NextFunction = jest.fn();

        allowUserJourneyMiddleware(req, res, nextFunction);

        expect(res.redirect).toHaveBeenCalledWith("/page-unavailable");
        expect(nextFunction).not.toHaveBeenCalled();
    });
});
