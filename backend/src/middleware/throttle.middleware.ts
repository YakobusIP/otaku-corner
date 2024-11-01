import { NextFunction, Request, Response } from "express";
import { env } from "../lib/env";

/**
 * Optional middleware to throttle backend responses by 5 seconds. **Ignores auth routes**
 *
 * Activates only if `ENABLE_THROTTLE` env is true
 */
export const throttleMiddleware = (
  _req: Request,
  _res: Response,
  next: NextFunction
) => {
  if (env.ENABLE_THROTTLE) {
    setTimeout(() => {
      return next();
    }, 5000);
  } else {
    return next();
  }
};
