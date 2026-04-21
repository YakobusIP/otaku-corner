import {
  Catch,
  ConflictException,
  ExceptionFilter,
  Injectable,
  NotFoundException
} from "@nestjs/common";

import { getRequestLogContext } from "@/common/logging/request-log-context";
import { StructuredLogger } from "@/common/logging/structured-logger.service";

import { Prisma } from "@prisma/client";

@Injectable()
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: StructuredLogger) {}

  catch(exception: Prisma.PrismaClientKnownRequestError) {
    const requestContext = getRequestLogContext();
    const mappedStatus =
      exception.code === "P2002" ? 409 : exception.code === "P2025" ? 404 : 500;
    this.logger.logApplication({
      level: mappedStatus >= 500 ? "error" : "warn",
      event: "db.prisma.known_error",
      message: "Prisma known request error",
      error: {
        name: exception.name,
        message: exception.message,
        stack: exception.stack ?? ""
      },
      meta: {
        prisma_code: exception.code,
        prisma_client_version: exception.clientVersion,
        prisma_meta: exception.meta ?? null,
        mapped_status: mappedStatus,
        correlation_id: requestContext?.correlation_id ?? null,
        request_id: requestContext?.request_id ?? null
      }
    });

    if (exception.code === "P2002") {
      throw new ConflictException("Resource already exists");
    }
    if (exception.code === "P2025") {
      throw new NotFoundException("Resource not found");
    }
    throw exception;
  }
}
