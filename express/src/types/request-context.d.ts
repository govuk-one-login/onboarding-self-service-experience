export type ContextProperty = keyof RequestContext;

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            context: Partial<RequestContext>;
        }
    }
}

export default interface RequestContext {
    serviceId: string;
}
