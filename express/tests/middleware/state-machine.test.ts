import {getNextPaths} from "../../src/middleware/state-machine";
import {request} from "../mocks";

describe("state-machine", () => {
    describe("getNextPaths - sign in", () => {
        it.each(["/register/resume-before-password", "/register/resume-after-password"])(
            "should move from enter email address to %s",
            expected => {
                const req = request({
                    path: "/enter-email-address",
                    baseUrl: "/sign-in"
                });
                getNextPaths(req);

                expect(req.session.nextPaths).toContain(expected);
            }
        );
    });

    describe("getNextPaths - register", () => {
        it.each([
            "/register/resume-before-password",
            "/register/resume-after-password",
            "/register/enter-email-code",
            "/register/account-exists"
        ])("should move from enter email address to %s", expected => {
            const req = request({
                path: "/enter-email-address",
                baseUrl: "/register"
            });
            getNextPaths(req);

            expect(req.session.nextPaths).toContain(expected);
        });

        it.each(["/register/create-password", "/register/resend-email-code"])("should move from enter email code to %s", expected => {
            const req = request({
                path: "/enter-email-code",
                baseUrl: "/register"
            });
            getNextPaths(req);

            expect(req.session.nextPaths).toContain(expected);
        });

        it("should move from resend email code to /register/enter-email-code", () => {
            const req = request({
                path: "/resend-email-code",
                baseUrl: "/register"
            });
            getNextPaths(req);

            expect(req.session.nextPaths).toContain("/register/enter-email-code");
        });

        it("should move from create password to /register/enter-phone-number", () => {
            const req = request({
                path: "/create-password",
                baseUrl: "/register"
            });
            getNextPaths(req);

            expect(req.session.nextPaths).toContain("/register/enter-phone-number");
        });

        it("should move from enter phone number to /register/enter-text-code", () => {
            const req = request({
                path: "/enter-phone-number",
                baseUrl: "/register"
            });
            getNextPaths(req);

            expect(req.session.nextPaths).toContain("/register/enter-text-code");
        });

        it.each(["/register/create-service", "/register/resend-text-code"])("should move from enter text code to %s", expected => {
            const req = request({
                path: "/enter-text-code",
                baseUrl: "/register"
            });
            getNextPaths(req);

            expect(req.session.nextPaths).toContain(expected);
        });

        it("should move from resend text code to /register/enter-text-code", () => {
            const req = request({
                path: "/resend-text-code",
                baseUrl: "/register"
            });
            getNextPaths(req);

            expect(req.session.nextPaths).toContain("/register/enter-text-code");
        });

        it("should move from resume before password to /register/create-password", () => {
            const req = request({
                path: "/resume-before-password",
                baseUrl: "/register"
            });
            getNextPaths(req);

            expect(req.session.nextPaths).toContain("/register/create-password");
        });

        it("should move from resume after password to /register/enter-phone-number", () => {
            const req = request({
                path: "/resume-after-password",
                baseUrl: "/register"
            });
            getNextPaths(req);

            expect(req.session.nextPaths).toContain("/register/enter-phone-number");
        });
    });

    describe("getNextPaths - services", () => {
        it("should move from list services to /register/create-service", () => {
            const req = request({
                path: "",
                baseUrl: "/services"
            });
            getNextPaths(req);

            expect(req.session.nextPaths).toContain("/register/create-service");
        });
    });
});
