import pinoHttp from "pino-http";
import logger from "./logger";

interface ResponseWithRaw {
    statusCode: number;
    raw?: {
        getHeader: (name: string) => string | number | string[] | undefined;
    };
}

interface RequestWithRaw {
    method: string;
    id: string;
    url: string;
    raw?: {
        headers?: Record<string, string | string[] | undefined>;
    };
}

export const requestSerializer = (req: RequestWithRaw) => ({
    id: req.id,
    method: req.method,
    url: req.url,
    headers: {
        "user-agent": req.raw?.headers?.["user-agent"],
        referer: req.raw?.headers?.["referer"]
    }
});

export const responseSerializer = (res: ResponseWithRaw) => ({
    statusCode: res.statusCode,
    headers: {
        "cache-control": res.raw?.getHeader("cache-control"),
        "last-modified": res.raw?.getHeader("last-modified"),
        etag: res.raw?.getHeader("etag"),
        "content-type": res.raw?.getHeader("content-type"),
        "content-length": res.raw?.getHeader("content-length")
    }
});

export const requestLoggingMiddleware = pinoHttp({
    logger,
    customProps: () => ({}),
    serializers: {
        req: requestSerializer,
        res: responseSerializer
    }
});
