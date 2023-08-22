/**
 * Manages the status of a new user signup to One Login Self Service
 */
export class SignupStatus {
    private state: Array<SignupStatusStage>;

    public constructor() {
        this.state = [];
    }

    /**
     * Set the contained state from an incoming Cognito string
     * @param newState string
     */
    public setState(newState: string): void {
        const stages: string[] = newState.split(",");
        stages.forEach(stage => {
            switch (stage) {
                case "HasEmail":
                    this.setStage(SignupStatusStage.HasEmail);
                    break;
                case "HasPassword":
                    this.setStage(SignupStatusStage.HasPassword);
                    break;
                case "HasPhoneNumber":
                    this.setStage(SignupStatusStage.HasPhoneNumber);
                    break;
                case "HasTextCode":
                    this.setStage(SignupStatusStage.HasTextCode);
                    break;
            }
        });
    }

    /**
     * Return the contained state formatted for Cognito string
     */
    public getState(): string {
        const stages: string[] = [];
        this.state.forEach(stage => {
            switch (stage) {
                case SignupStatusStage.HasEmail:
                    stages.push("HasEmail");
                    break;
                case SignupStatusStage.HasPassword:
                    stages.push("HasPassword");
                    break;
                case SignupStatusStage.HasPhoneNumber:
                    stages.push("HasPhoneNumber");
                    break;
                case SignupStatusStage.HasTextCode:
                    stages.push("HasTextCode");
                    break;
            }
        });

        return stages.join();
    }

    /**
     * Return true if the specified stage has been set (i.e. has been fulfilled)
     * @param checkStage stageSignupStatusStage
     */
    public hasStage(checkStage: SignupStatusStage): boolean {
        this.state.forEach(stage => {
            if (stage === checkStage) return true;
        });

        return false;
    }

    /**
     * Sets the specified stage as true/false, per the second parameter
     * @param stage SignupStatusStage
     * @param isReached boolean
     */
    public setStage(stage: SignupStatusStage, isReached = true): void {
        const hasStage: boolean = this.hasStage(stage);
        if ((hasStage && isReached) || (!hasStage && !isReached)) {
            // We're where we want to be already
            return;
        } else if (hasStage && !isReached) {
            // Want to remove the stage
            this.state.pop();
        } else {
            // Want to add the stage
            this.state.push(stage);
        }
    }

    /**
     * Return true all configured stages have been set
     */
    public hasAllStages(): boolean {
        return (
            this.hasStage(SignupStatusStage.HasEmail) &&
            this.hasStage(SignupStatusStage.HasPassword) &&
            this.hasStage(SignupStatusStage.HasPhoneNumber) &&
            this.hasStage(SignupStatusStage.HasTextCode)
        );
    }
}

export enum SignupStatusStage {
    HasEmail,
    HasPassword,
    HasPhoneNumber,
    HasTextCode
}
