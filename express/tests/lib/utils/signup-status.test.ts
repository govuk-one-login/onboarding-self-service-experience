import "lib/utils/signup-status";
import {SignupStatus, SignupStatusStage} from "../../../src/lib/utils/signup-status";

describe("Exercise Signup Status class", () => {
    describe("Set empty status and add one stage", () => {
        it("Get the known value", () => {
            const signupStatus: SignupStatus = new SignupStatus();

            signupStatus.setStage(SignupStatusStage.HasPassword);

            expect(signupStatus.hasStage(SignupStatusStage.HasPassword)).toBe(true);

            expect(signupStatus.hasAllStages()).toBe(false);

            expect(signupStatus.getState()).toBe("HasPassword");
        });
    });

    describe("Set populated status - one stage", () => {
        it("Get the known value", () => {
            const signupStatus: SignupStatus = new SignupStatus();

            signupStatus.setState("HasPassword");

            expect(signupStatus.hasStage(SignupStatusStage.HasPassword)).toBe(true);

            expect(signupStatus.hasAllStages()).toBe(false);

            expect(signupStatus.getState()).toBe("HasPassword");
        });
    });

    describe("Set populated status - multiple stages", () => {
        it("Get the known value", () => {
            const signupStatus: SignupStatus = new SignupStatus();

            signupStatus.setState("HasEmail,HasPassword,HasTextCode");

            expect(signupStatus.hasStage(SignupStatusStage.HasEmail)).toBe(true);
            expect(signupStatus.hasStage(SignupStatusStage.HasPhoneNumber)).toBe(false);
            expect(signupStatus.hasStage(SignupStatusStage.HasTextCode)).toBe(true);
            expect(signupStatus.hasStage(SignupStatusStage.HasPassword)).toBe(true);

            expect(signupStatus.hasAllStages()).toBe(false);

            expect(signupStatus.getState()).toBe("HasEmail,HasPassword,HasTextCode");
        });
    });

    describe("Set populated status - multiple stages; remove a stage", () => {
        it("Get the known value", () => {
            const signupStatus: SignupStatus = new SignupStatus();

            signupStatus.setState("HasEmail,HasPassword,HasTextCode");

            expect(signupStatus.hasStage(SignupStatusStage.HasEmail)).toBe(true);
            expect(signupStatus.hasStage(SignupStatusStage.HasPhoneNumber)).toBe(false);
            expect(signupStatus.hasStage(SignupStatusStage.HasTextCode)).toBe(true);
            expect(signupStatus.hasStage(SignupStatusStage.HasPassword)).toBe(true);

            signupStatus.setStage(SignupStatusStage.HasTextCode, false);

            expect(signupStatus.hasAllStages()).toBe(false);

            expect(signupStatus.getState()).toBe("HasEmail,HasPassword");
        });
    });

    describe("Set populated status - all stages", () => {
        it("Get the known value", () => {
            const signupStatus: SignupStatus = new SignupStatus();

            expect(signupStatus.getState()).toBe("");

            signupStatus.setStage(SignupStatusStage.HasEmail);
            signupStatus.setStage(SignupStatusStage.HasPhoneNumber);
            signupStatus.setStage(SignupStatusStage.HasTextCode);
            signupStatus.setStage(SignupStatusStage.HasPassword);

            expect(signupStatus.hasStage(SignupStatusStage.HasEmail)).toBe(true);
            expect(signupStatus.hasStage(SignupStatusStage.HasPhoneNumber)).toBe(true);
            expect(signupStatus.hasStage(SignupStatusStage.HasTextCode)).toBe(true);
            expect(signupStatus.hasStage(SignupStatusStage.HasPassword)).toBe(true);

            expect(signupStatus.hasAllStages()).toBe(true);

            expect(signupStatus.getState()).toBe("HasEmail,HasPhoneNumber,HasTextCode,HasPassword");
        });
    });
});
