export type ContextProperty = keyof RequestContext;

declare global {
    namespace Express {
        interface Request {
            context: Partial<RequestContext>;
        }
    }
}

interface RequestContext {
    serviceId: string;
}
