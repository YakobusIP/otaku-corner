import { HttpException } from "@nestjs/common";

import type { LogLevel } from "@/common/logging/structured-log.types";

export const storageFailureLogLevel = (error: unknown): LogLevel => {
  if (error instanceof HttpException) {
    return error.getStatus() >= 500 ? "error" : "warn";
  }
  return "error";
};
