import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";

export const requestLogMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.on("finish", async () => {
    const data: Prisma.RequestLogCreateInput = {
      hostname: req.hostname,
      ip: (req.headers["x-forwarded-for"] as string) || req.ip,
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      status: res.statusCode
    };

    await prisma.requestLog.create({ data });
  });

  return next();
};
