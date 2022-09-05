interface RenderOptions {
    values?: {[name: string]: string};
    errorMessages?: {[name: string]: string};
}

export class RenderError extends Error {
    template: string;
    options?: RenderOptions;

    constructor(template: string, message?: string, options?: RenderOptions) {
        super(message);
        this.name = "SelfServiceRenderError";
        this.template = template;
        this.options = options;
    }
}

export class RedirectError extends Error {
    route: string;

    constructor(route: string, message?: string) {
        super(message);
        this.name = "SelfServiceRedirectError";
        this.route = route;
    }
}

export class SelfServiceErrors {
    static Render(template: string, message?: string, options?: RenderOptions): RenderError {
        return new RenderError(template, message, options);
    }

    static Redirect(route: string, message?: string): RedirectError {
        return new RedirectError(route, message);
    }
}
