import {Request} from "express";
import setSignInStatus from "../../src/middleware/sign-in-status";
import {request, response} from "../mocks";

let req: Request;

const next = jest.fn();
const res = response();

describe("Set sign-in status on the response", () => {
    beforeEach(() => {
        req = request();
    });

    it("Set res.locals.isSignedIn to true if req.session.isSignedIn is true", () => {
        req.session.isSignedIn = true;
        setSignInStatus(req, res, next);

        expect(next).toBeCalledTimes(1);
        expect(res.locals?.isSignedIn).toBe(true);
    });

    it("Set res.locals.isSignedIn to false if req.session.isSignedIn is false", () => {
        req.session.isSignedIn = false;
        setSignInStatus(req, res, next);

        expect(next).toBeCalledTimes(1);
        expect(res.locals?.isSignedIn).toBe(false);
    });

    it("Set res.locals.isSignedIn to false if req.session.isSignedIn is undefined", () => {
        req.session.isSignedIn = undefined;
        setSignInStatus(req, res, next);

        expect(next).toBeCalledTimes(1);
        expect(res.locals?.isSignedIn).toBe(false);
    });
});
