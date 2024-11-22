import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";
import { IncomingHttpHeaders } from "http";

const sanitizeHeaders = (headers: IncomingHttpHeaders) => {
  const { _authorization, _cookie, ...safeHeaders } = headers;
  return safeHeaders;
};

export const requestLogMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let safeBody = req.body;

  if (req.url.includes("/login")) {
    if (req.body && typeof req.body === "object" && !Array.isArray(req.body)) {
      safeBody = { ...req.body } as { [key: string]: string };

      if ("pin1" in safeBody) {
        safeBody["pin1"] = "***";
      }

      if ("pin2" in safeBody) {
        safeBody["pin2"] = "***";
      }
    }
  }
  res.on("finish", async () => {
    const data: Prisma.RequestLogCreateInput = {
      hostname: req.hostname,
      ip: (req.headers["x-forwarded-for"] as string) || req.ip,
      method: req.method,
      url: req.url,
      headers: sanitizeHeaders(req.headers),
      body: safeBody,
      status: res.statusCode
    };

    await prisma.requestLog.create({ data });
  });

  return next();
};
