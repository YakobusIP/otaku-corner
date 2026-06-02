import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  Injectable,
  NotFoundException
} from "@nestjs/common";

import { StructuredLogger } from "@/common/logging/structured-logger.service";

import { Prisma } from "@prisma/client";
import type { Response } from "express";

@Injectable()
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: StructuredLogger) {}

  catch(
    exception: Prisma.PrismaClientKnownRequestError,
    host: ArgumentsHost
  ): void {
    const mappedStatus =
      exception.code === "P2002" ? 409 : exception.code === "P2025" ? 404 : 500;

    this.logger.logDb({
      level: mappedStatus >= 500 ? "error" : "warn",
      event: "db.prisma.known_error",
      message: "Prisma known request error",
      error: {
        name: exception.name,
        message: exception.message,
        stack: exception.stack ?? "",
        code: exception.code
      },
      meta: {
        prisma_code: exception.code,
        prisma_client_version: exception.clientVersion,
        prisma_meta: exception.meta ?? null,
        mapped_status: mappedStatus
      }
    });

    const http = host.switchToHttp();
    const response = http.getResponse<Response>();

    if (exception.code === "P2002") {
      const body = new ConflictException(
        "Resource already exists"
      ).getResponse();
      response.status(409).json(body);
      return;
    }

    if (exception.code === "P2025") {
      const body = new NotFoundException("Resource not found").getResponse();
      response.status(404).json(body);
      return;
    }

    response.status(500).json({
      statusCode: 500,
      message: "Internal server error"
    });
  }
}
