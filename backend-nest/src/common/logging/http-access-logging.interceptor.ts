import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor
} from "@nestjs/common";
import { PATH_METADATA } from "@nestjs/common/constants";

import {
  RequestLogContextStore,
  runWithRequestLogContext
} from "@/common/logging/request-log-context";
import type { HttpLogMeta } from "@/common/logging/structured-log.types";
import type { LogLevel } from "@/common/logging/structured-log.types";
import type { StructuredLogError } from "@/common/logging/structured-log.types";
import { StructuredLogger } from "@/common/logging/structured-logger.service";

import type { Request, Response } from "express";
import { Observable } from "rxjs";
import { finalize, tap } from "rxjs/operators";
import {
  validate as uuidValidate,
  version as uuidVersion,
  v4 as uuidv4
} from "uuid";

const GLOBAL_API_PREFIX = "api";

function normalizePathMeta(meta: string | string[] | undefined): string {
  if (meta === undefined || meta === "") {
    return "";
  }
  const parts = (Array.isArray(meta) ? meta : [meta]).filter(Boolean);
  return parts.join("/");
}

function buildRouteTemplate(
  controllerMeta: string | string[] | undefined,
  handlerMeta: string | string[] | undefined
): string {
  const c = normalizePathMeta(controllerMeta);
  const h = normalizePathMeta(handlerMeta);
  const segments = [GLOBAL_API_PREFIX, c, h].filter((s) => s.length > 0);
  return `/${segments.join("/")}`;
}

function parseCorrelationHeader(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  if (uuidValidate(trimmed) && uuidVersion(trimmed) === 4) {
    return trimmed;
  }
  return undefined;
}

function clientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0]?.trim() ?? "";
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    return forwarded[0].split(",")[0]?.trim() ?? "";
  }
  return req.ip ?? req.socket.remoteAddress ?? "";
}

@Injectable()
export class HttpAccessLoggingInterceptor implements NestInterceptor {
  constructor(private readonly structured: StructuredLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== "http") {
      return next.handle();
    }

    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();

    const headerCorrelation = parseCorrelationHeader(
      req.headers["x-correlation-id"]
    );
    const correlation_id = headerCorrelation ?? uuidv4();
    const request_id = uuidv4();
    const store: RequestLogContextStore = {
      correlation_id,
      request_id,
      user_id: null
    };
    req.requestLogStore = store;

    const started = performance.now();
    let routeError: unknown;

    const controller = context.getClass();
    const handler = context.getHandler();
    const controllerPath = Reflect.getMetadata(PATH_METADATA, controller) as
      | string
      | string[]
      | undefined;
    const handlerPath = Reflect.getMetadata(PATH_METADATA, handler) as
      | string
      | string[]
      | undefined;
    const routeTemplate = buildRouteTemplate(controllerPath, handlerPath);

    return runWithRequestLogContext(store, () =>
      next.handle().pipe(
        tap({
          error: (err: unknown) => {
            routeError = err;
          }
        }),
        finalize(() => {
          const user = (req as Request & { user?: { userId: number } }).user;
          store.user_id = user?.userId ?? null;

          const duration_ms = Math.round(performance.now() - started);
          const path = (req.originalUrl ?? req.url ?? "").split("?")[0] ?? "";

          let status = res.statusCode;
          if (routeError instanceof HttpException) {
            status = routeError.getStatus();
          } else if (routeError && status < 400) {
            status = 500;
          }
          if (!status || status < 100) {
            status = routeError ? 500 : 200;
          }

          const level: LogLevel =
            status >= 500 ? "error" : status >= 400 ? "warn" : "info";
          const event = status >= 400 ? "request.failed" : "request.completed";
          const message =
            status >= 400 ? "Request failed" : "Request completed";

          let error: StructuredLogError | null = null;
          const meta: HttpLogMeta & Record<string, unknown> = {
            method: req.method,
            path,
            route: routeTemplate,
            status_code: status,
            duration_ms,
            client_ip: clientIp(req),
            user_agent: req.get("user-agent") ?? ""
          };

          if (status >= 400 && routeError instanceof HttpException) {
            const response = routeError.getResponse();
            meta.error_response = response;
            error = {
              name: routeError.name,
              message:
                typeof response === "string" && response.length > 0
                  ? response
                  : routeError.message,
              stack: status >= 500 ? (routeError.stack ?? "") : ""
            };
          } else if (status >= 500 && routeError instanceof Error) {
            error = {
              name: routeError.name,
              message: routeError.message,
              stack: routeError.stack ?? ""
            };
          } else if (status >= 500 && routeError) {
            const message =
              typeof routeError === "string"
                ? routeError
                : routeError instanceof Error
                  ? routeError.message
                  : "Unknown error";
            error = {
              name: "Error",
              message,
              stack: ""
            };
          }
          if (status >= 400 && routeError) {
            meta.error_type =
              routeError instanceof Error ? routeError.name : typeof routeError;
          }

          this.structured.logHttpAccess({
            level,
            event,
            message,
            correlation_id,
            request_id,
            user_id: store.user_id,
            error,
            meta
          });
        })
      )
    );
  }
}
