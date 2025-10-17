import type {NextFunction, Request, Response} from "express";

export function transitionForbidden(req: Request): boolean {
    const nextPaths = req.session.nextPaths as string[];
    const optionalPaths = req.session.optionalPaths as string[];
    const currentPath = req.baseUrl + req.path;
    return !nextPaths?.includes(currentPath) && !optionalPaths?.includes(currentPath);
}

export function allowUserJourneyMiddleware(req: Request, res: Response, next: NextFunction): void {
    if (transitionForbidden(req)) {
        const nextPath = req.session.nextPaths as string[];
        const optionalPaths = req.session.optionalPaths as string[];
        console.warn(
            `User tried invalid journey to ${req.baseUrl + req.path}, but session indicates they should be on ${nextPath?.join(", ")}${
                optionalPaths?.length > 0 ? " and optionalPaths " + optionalPaths?.join(", ") : ""
            }`
        );
        return res.redirect("/page-unavailable");
    }

    next();
}
