import {getNextPathsAndRedirect} from "../../src/middleware/state-machine";
import {request, response} from "../mocks";

describe("state-machine", () => {
    describe("getNextPaths - sign in", () => {
        it.each(["/register/resume-before-password", "/register/resume-after-password", "/register/resend-email-code"])(
            "should move from enter email address to %s",
            expected => {
                const req = request({
                    path: "/enter-email-address",
                    baseUrl: "/sign-in"
                });
                const mockRes = response();

                getNextPathsAndRedirect(req, mockRes, "/test-url");

                expect(req.session.optionalPaths).toContain(expected);
            }
        );

        it("should move from enter text code to /register/create-service", () => {
            const req = request({
                path: "/enter-text-code",
                baseUrl: "/sign-in"
            });
            const mockRes = response();

            getNextPathsAndRedirect(req, mockRes, "/test-url");

            expect(req.session.optionalPaths).toContain("/register/create-service");
        });
    });

    describe("getNextPaths - register", () => {
        it("should move from enter email address to /register/enter-email-code", () => {
            const req = request({
                path: "/enter-email-address",
                baseUrl: "/register"
            });
            const mockRes = response();

            getNextPathsAndRedirect(req, mockRes, "/test-url");

            expect(req.session.nextPaths).toContain("/register/enter-email-code");
            expect(req.session.optionalPaths).toContain("/register/resume-before-password");
            expect(req.session.optionalPaths).toContain("/register/resume-after-password");
            expect(req.session.optionalPaths).toContain("/register/account-exists");
            expect(req.session.optionalPaths).toContain("/register/resend-email-code");
        });

        it("should move from enter email code to /register/create-password", () => {
            const req = request({
                path: "/enter-email-code",
                baseUrl: "/register"
            });
            const mockRes = response();

            getNextPathsAndRedirect(req, mockRes, "/test-url");

            expect(req.session.nextPaths).toContain("/register/create-password");
            expect(req.session.optionalPaths).toContain("/register/too-many-codes");
        });

        it("should move from resend email code to /register/enter-email-code", () => {
            const req = request({
                path: "/resend-email-code",
                baseUrl: "/register"
            });
            const mockRes = response();

            getNextPathsAndRedirect(req, mockRes, "/test-url");

            expect(req.session.nextPaths).toContain("/register/enter-email-code");
            expect(req.session.optionalPaths).toContain("/register/resend-email-code");
            expect(req.session.optionalPaths).toContain("/register/too-many-codes");
        });

        it("should move from create password to /register/enter-phone-number", () => {
            const req = request({
                path: "/create-password",
                baseUrl: "/register"
            });
            const mockRes = response();

            getNextPathsAndRedirect(req, mockRes, "/test-url");

            expect(req.session.nextPaths).toContain("/register/enter-phone-number");
        });

        it("should move from enter phone number to /register/enter-text-code", () => {
            const req = request({
                path: "/enter-phone-number",
                baseUrl: "/register"
            });
            const mockRes = response();

            getNextPathsAndRedirect(req, mockRes, "/test-url");

            expect(req.session.nextPaths).toContain("/register/enter-text-code");
            expect(req.session.optionalPaths).toContain("/register/resend-text-code");
            expect(req.session.optionalPaths).toContain("/register/enter-phone-number");
        });

        it("should move from enter text code to /register/create-service", () => {
            const req = request({
                path: "/enter-text-code",
                baseUrl: "/register"
            });
            const mockRes = response();

            getNextPathsAndRedirect(req, mockRes, "/test-url");

            expect(req.session.nextPaths).toContain("/register/create-service");
        });

        it("should move from resend text code to /register/enter-text-code", () => {
            const req = request({
                path: "/resend-text-code",
                baseUrl: "/register"
            });
            const mockRes = response();

            getNextPathsAndRedirect(req, mockRes, "/test-url");

            expect(req.session.nextPaths).toContain("/register/enter-text-code");
            expect(req.session.optionalPaths).toContain("/register/resend-text-code");
            expect(req.session.optionalPaths).toContain("/register/enter-phone-number");
        });

        it("should move from resume before password to /register/create-password", () => {
            const req = request({
                path: "/resume-before-password",
                baseUrl: "/register"
            });
            const mockRes = response();

            getNextPathsAndRedirect(req, mockRes, "/test-url");

            expect(req.session.nextPaths).toContain("/register/create-password");
            expect(req.session.optionalPaths).toContain("/register/too-many-codes");
        });

        it("should move from resume after password to /register/enter-phone-number", () => {
            const req = request({
                path: "/resume-after-password",
                baseUrl: "/register"
            });
            const mockRes = response();

            getNextPathsAndRedirect(req, mockRes, "/test-url");

            expect(req.session.nextPaths).toContain("/register/enter-phone-number");
        });
    });

    describe("getNextPaths - services", () => {
        it("should move from list services to /register/create-service", () => {
            const req = request({
                path: "",
                baseUrl: "/services/"
            });
            const mockRes = response();

            getNextPathsAndRedirect(req, mockRes, "/test-url");

            expect(req.session.optionalPaths).toContain("/register/create-service");
        });
    });
});
