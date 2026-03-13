import {
  Catch,
  ConflictException,
  ExceptionFilter,
  NotFoundException
} from "@nestjs/common";

import { Prisma } from "@prisma/client";

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError) {
    if (exception.code === "P2002") {
      throw new ConflictException("Resource already exists");
    }
    if (exception.code === "P2025") {
      throw new NotFoundException("Resource not found");
    }
    throw exception;
  }
}
