export type ContextProperty = keyof RequestContext;

declare global {
    namespace Express {
        interface Request {
            context: Partial<RequestContext>;
        }
    }
}

export default interface RequestContext {
    serviceId: string;
}
