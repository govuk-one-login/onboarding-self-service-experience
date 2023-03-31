import express, {NextFunction, Response} from "express";

declare global {
    namespace Express {
        interface Request {
            context: Partial<Record<ContextProperty, string>>;
        }
    }
}

export interface RequestParamHandler extends express.RequestParamHandler {
    (req: express.Request, res: Response, next: NextFunction, value: string, name: ContextProperty): void;
}

export type ContextProperty = keyof RequestContext;

interface RequestContext {
    serviceId: string;
}
