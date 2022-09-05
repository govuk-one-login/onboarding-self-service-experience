export default interface ErrorOptions {
    template: string;
    values?: {[name: string]: string};
    errorMessages?: {[name: string]: string};
}

export {ErrorOptions};
