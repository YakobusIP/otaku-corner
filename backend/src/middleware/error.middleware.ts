import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { CustomError, InternalServerError } from "../lib/error";
import { Prisma } from "@prisma/client";

export const errorMiddleware = async (
  err: CustomError,
  req: Request,
  res: Response,
  _: NextFunction
) => {
  const data: Prisma.ErrorLogCreateInput = {
    message:
      err instanceof InternalServerError ? err.originalMessage : err.message,
    type: err.type,
    statusCode: err.statusCode,
    stack: err.stack,
    route: req.url,
    timestamp: new Date()
  };

  // Log to console
  console.error(data);

  // Log to database
  await prisma.errorLog.create({ data });

  return res.status(err.statusCode || 500).json({
    error: err.message
  });
};
