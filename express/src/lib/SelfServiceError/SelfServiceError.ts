import ErrorOptions from "./ErrorOptions";

class SelfServiceError extends Error {
    options?: ErrorOptions;
    constructor(message: string, options?: ErrorOptions) {
        super(message);
        this.name = "SelfServiceError";
        this.options = options;
    }
}

export {SelfServiceError}