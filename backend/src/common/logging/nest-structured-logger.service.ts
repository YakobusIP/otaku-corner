import { Injectable, LoggerService } from "@nestjs/common";

import { redactObject } from "@/common/logging/log-redaction";
import type { StructuredLogError } from "@/common/logging/structured-log.types";
import { StructuredLogger } from "@/common/logging/structured-logger.service";

const toStructuredError = (err: unknown): StructuredLogError | null => {
  if (!(err instanceof Error)) {
    return null;
  }
  return {
    name: err.name,
    message: err.message,
    stack: err.stack ?? "",
    code:
      "code" in err && typeof (err as { code?: unknown }).code === "string"
        ? (err as { code: string }).code
        : undefined
  };
};

const sanitizeMeta = (value: unknown): Record<string, unknown> | undefined => {
  if (value === null || value === undefined) {
    return undefined;
  }
  if (typeof value === "object" && !Array.isArray(value)) {
    return redactObject(value as Record<string, unknown>);
  }
  return { value };
};

@Injectable()
export class NestStructuredLoggerService implements LoggerService {
  constructor(private readonly structured: StructuredLogger) {}

  log(message: unknown, context?: string): void {
    this.structured.logApplication({
      level: "info",
      event: "nest.log",
      message: this.formatMessage(message),
      error: null,
      nestContext: context,
      meta: sanitizeMeta(
        typeof message === "object" &&
          message !== null &&
          !Array.isArray(message)
          ? message
          : undefined
      )
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
      nestContext: context,
      meta: sanitizeMeta(message)
    });
  }

  warn(message: unknown, context?: string): void {
    this.structured.logApplication({
      level: "warn",
      event: "nest.warn",
      message: this.formatMessage(message),
      error: null,
      nestContext: context,
      meta: sanitizeMeta(message)
    });
  }

  debug(message: unknown, context?: string): void {
    this.structured.logApplication({
      level: "debug",
      event: "nest.debug",
      message: this.formatMessage(message),
      error: null,
      nestContext: context,
      meta: sanitizeMeta(message)
    });
  }

  verbose(message: unknown, context?: string): void {
    this.structured.logApplication({
      level: "debug",
      event: "nest.verbose",
      message: this.formatMessage(message),
      error: null,
      nestContext: context,
      meta: sanitizeMeta(message)
    });
  }

  private formatMessage(message: unknown): string {
    if (typeof message === "string") {
      return message;
    }
    if (message instanceof Error) {
      return message.message;
    }
    try {
      return JSON.stringify(message);
    } catch {
      return String(message);
    }
  }
}
