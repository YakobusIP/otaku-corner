import { Injectable, LoggerService } from "@nestjs/common";

import type { StructuredLogError } from "@/common/logging/structured-log.types";
import { StructuredLogger } from "@/common/logging/structured-logger.service";

function toStructuredError(err: unknown): StructuredLogError | null {
  if (!(err instanceof Error)) {
    return null;
  }
  return {
    name: err.name,
    message: err.message,
    stack: err.stack ?? ""
  };
}

@Injectable()
export class WinstonLoggerService implements LoggerService {
  constructor(private readonly structured: StructuredLogger) {}

  log(message: unknown, context?: string): void {
    this.structured.logApplication({
      level: "info",
      event: "nest.log",
      message: this.formatMessage(message),
      error: null,
      nestContext: context
    });
  }

  error(message: unknown, trace?: string, context?: string): void {
    const err =
      message instanceof Error
        ? toStructuredError(message)
        : trace
          ? {
              name: "Error",
              message: this.formatMessage(message),
              stack: trace
            }
          : null;
    this.structured.logApplication({
      level: "error",
      event: "nest.error",
      message: this.formatMessage(message),
      error: err,
      nestContext: context
    });
  }

  warn(message: unknown, context?: string): void {
    this.structured.logApplication({
      level: "warn",
      event: "nest.warn",
      message: this.formatMessage(message),
      error: null,
      nestContext: context
    });
  }

  debug(message: unknown, context?: string): void {
    this.structured.logApplication({
      level: "debug",
      event: "nest.debug",
      message: this.formatMessage(message),
      error: null,
      nestContext: context
    });
  }

  verbose(message: unknown, context?: string): void {
    this.structured.logApplication({
      level: "debug",
      event: "nest.verbose",
      message: this.formatMessage(message),
      error: null,
      nestContext: context
    });
  }

  private formatMessage(message: unknown): string {
    if (typeof message === "string") {
      return message;
    }
    try {
      return JSON.stringify(message);
    } catch {
      return String(message);
    }
  }
}
