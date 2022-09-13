export interface ErrorOptions {
    template: string;
    values?: {[name: string]: string};
    errorMessages?: {[name: string]: string};
}

export default class SelfServiceError extends Error {
    options?: ErrorOptions;

    constructor(message: string, options?: ErrorOptions) {
        super(message);
        this.name = "SelfServiceError";
        this.options = options;
    }
}
