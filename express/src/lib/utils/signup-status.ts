/**
 * Manages the status of a new user signup to One Login Self Service
 */
export class SignupStatus {
    private state: string; // Contains the concatenated set of statuses

    public constructor() {
        this.state = "";
    }

    /**
     * Set the contained state from an incoming Cognito string
     */
    public setState(newState: string): void {
    }

    /**
     * Return the contained state formatted for Cognito string
     */
    public getState(): string {
        return "";
    }

    /**
     * Return true if the specified stage has been set (i.e. has been fulfilled)
     * @param stage
     */
    public hasStage(stage: SignupStatusStage): boolean {
        return true;
    }

    /**
     * Sets the specified stage as true/false, per the second parameter
     * @param stage
     */
    public setStage(stage: SignupStatusStage, isReached: boolean): void {
    }
}

export enum SignupStatusStage {
    HasEmail,
    HasPassword,
    HasPhoneNumber,
    HasTextCode,
    HasCompleted
}
