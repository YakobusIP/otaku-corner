import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { getRequestLogContext } from "@/common/logging/request-log-context";
import type {
  HttpLogMeta,
  LogEnvironment,
  LogLevel,
  QueueLogMeta,
  StructuredLogError,
  StructuredLogLine
} from "@/common/logging/structured-log.types";
import { STRUCTURED_WINSTON } from "@/common/logging/structured-winston.factory";

import type { Logger as WinstonLoggerType } from "winston";

function normalizeLogEnvironment(nodeEnv: string | undefined): LogEnvironment {
  if (
    nodeEnv === "production" ||
    nodeEnv === "staging" ||
    nodeEnv === "development" ||
    nodeEnv === "test"
  ) {
    return nodeEnv;
  }
  return "development";
}

type StructuredLogEmitInput = Omit<
  StructuredLogLine,
  | "timestamp"
  | "service"
  | "environment"
  | "correlation_id"
  | "request_id"
  | "user_id"
> & {
  timestamp?: string;
  service?: string;
  environment?: LogEnvironment;
  correlation_id?: string | null;
  request_id?: string | null;
  user_id?: string | number | null;
};

@Injectable()
export class StructuredLogger {
  private readonly serviceName: string;

  private readonly environment: LogEnvironment;

  constructor(
    @Inject(STRUCTURED_WINSTON)
    private readonly winston: WinstonLoggerType,
    private readonly config: ConfigService
  ) {
    this.serviceName = this.config.get<string>("LOG_SERVICE_NAME") ?? "backend";
    this.environment = normalizeLogEnvironment(
      this.config.get<string>("NODE_ENV")
    );
  }

  emit(line: StructuredLogEmitInput): void {
    const als = getRequestLogContext();
    const full: StructuredLogLine = {
      timestamp: line.timestamp ?? new Date().toISOString(),
      level: line.level,
      service: line.service ?? this.serviceName,
      environment: line.environment ?? this.environment,
      context: line.context,
      event: line.event,
      message: line.message,
      correlation_id: line.correlation_id ?? als?.correlation_id ?? null,
      request_id: line.request_id ?? als?.request_id ?? null,
      user_id: line.user_id ?? als?.user_id ?? null,
      error: line.error ?? null,
      meta: line.meta
    };
    this.winston.log({
      level: full.level,
      message: JSON.stringify(full)
    });
  }

  logHttpAccess(params: {
    level: LogLevel;
    event: string;
    message: string;
    correlation_id: string;
    request_id: string;
    user_id: string | number | null;
    error: StructuredLogError | null;
    meta: HttpLogMeta & Record<string, unknown>;
  }): void {
    this.emit({
      level: params.level,
      context: "http",
      event: params.event,
      message: params.message,
      correlation_id: params.correlation_id,
      request_id: params.request_id,
      user_id: params.user_id,
      error: params.error,
      meta: params.meta
    });
  }

  logQueue(params: {
    level: LogLevel;
    event: string;
    message: string;
    correlation_id: string;
    request_id: string | null;
    user_id: string | number | null;
    error: StructuredLogError | null;
    meta: QueueLogMeta & Record<string, unknown>;
  }): void {
    this.emit({
      level: params.level,
      context: "queue",
      event: params.event,
      message: params.message,
      correlation_id: params.correlation_id,
      request_id: params.request_id,
      user_id: params.user_id,
      error: params.error,
      meta: params.meta
    });
  }

  logApplication(params: {
    level: LogLevel;
    event: string;
    message: string;
    error: StructuredLogError | null;
    meta?: Record<string, unknown>;
    nestContext?: string;
  }): void {
    const meta: Record<string, unknown> = {
      ...(params.meta ?? {})
    };

    if (params.nestContext !== undefined) {
      meta.nest_context = params.nestContext;
    }

    this.emit({
      level: params.level,
      context: "application",
      event: params.event,
      message: params.message,
      error: params.error,
      meta
    });
  }
}
