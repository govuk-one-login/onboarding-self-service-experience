import "lib/utils/signup-status";
import {SignupStatus, SignupStatusStage} from "../../../src/lib/utils/signup-status";

const signupStatus: SignupStatus = new SignupStatus();

describe("Exercise Signup Status class", () => {
    describe("Exercise Signup Status class, stages and overall state", () => {
        signupStatus.setState("HasEmail");

        it("Return the value if present", () => {
            expect(signupStatus.getState()).toBe("HasEmail");
        });

        it("Get the known value", () => {
            expect(signupStatus.hasStage(SignupStatusStage.HasEmail)).toBe(true);
        });

        it("Get the unknown value", () => {
            expect(signupStatus.hasStage(SignupStatusStage.HasPassword)).toBe(false);
        });

        it("Set a value and check", () => {
            signupStatus.setStage(SignupStatusStage.HasPassword);
            expect(signupStatus.hasStage(SignupStatusStage.HasEmail)).toBe(true);
            expect(signupStatus.hasStage(SignupStatusStage.HasPassword)).toBe(true);
            expect(signupStatus.hasStage(SignupStatusStage.HasTextCode)).toBe(false);
        });

        it("Set remaining values and check", () => {
            signupStatus.setStage(SignupStatusStage.HasPhoneNumber);
            signupStatus.setStage(SignupStatusStage.HasTextCode);
            expect(signupStatus.hasStage(SignupStatusStage.HasPhoneNumber)).toBe(true);
            expect(signupStatus.hasStage(SignupStatusStage.HasTextCode)).toBe(true);
        });

        it("Return the value if present", () => {
            expect(signupStatus.getState()).toBe("HasEmail,HasPassword,HasPhoneNumber,HasTextCode");
        });

        it("Check we have all stages", () => {
            expect(signupStatus.hasAllStages()).toBe(true);
        });
    });
});
