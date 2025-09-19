import type { NextFunction, Request, Response } from "express";

export function transitionForbidden(req: Request): boolean {
  const nextPaths = req.session.nextPaths as string[];
  const currentPath = req.baseUrl + req.path;
  console.log("in transition forbidden, nextPaths: " + nextPaths.join() + " and current path: "+ currentPath);
  return (
    !nextPaths.includes(currentPath)
  );
}

export function allowUserJourneyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (transitionForbidden(req)) {
    const nextPath = req.session.nextPaths as string[];
    console.warn(
      `User tried invalid journey to ${
        req.baseUrl + req.path
      }, but session indicates they should be on ${nextPath.join()}`
    );
    //return res.redirect("/there-is-a-problem");
  }

  next();
}
