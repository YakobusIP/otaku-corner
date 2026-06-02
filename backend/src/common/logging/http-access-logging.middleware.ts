import { HttpException } from "@nestjs/common";

import {
  clientIp,
  createRequestId,
  requestPathWithoutQuery,
  resolveCorrelationId,
  responseContentLength
} from "@/common/logging/http-request-log.utils";
import {
  RequestLogContextStore,
  runWithRequestLogContext
} from "@/common/logging/request-log-context";
import type { HttpLogMeta } from "@/common/logging/structured-log.types";
import type { LogLevel } from "@/common/logging/structured-log.types";
import type { StructuredLogError } from "@/common/logging/structured-log.types";
import { StructuredLogger } from "@/common/logging/structured-logger.service";

import type { NextFunction, Request, Response } from "express";

type RequestWithLogState = Request & {
  requestLogStore?: RequestLogContextStore;
  requestLogStartedAt?: number;
  requestLogRouteError?: unknown;
  requestLogAccessLogged?: boolean;
};

const resolveStatusCode = (req: RequestWithLogState, res: Response): number => {
  const routeError = req.requestLogRouteError;
  let status = res.statusCode;
  if (routeError instanceof HttpException) {
    status = routeError.getStatus();
  } else if (routeError && status < 400) {
    status = 500;
  }
  if (!status || status < 100) {
    status = routeError ? 500 : 200;
  }
  return status;
};

const buildAccessLog = (
  logger: StructuredLogger,
  req: RequestWithLogState,
  res: Response,
  event: "request.completed" | "request.failed" | "request.aborted"
): void => {
  if (req.requestLogAccessLogged) {
    return;
  }
  req.requestLogAccessLogged = true;

  const store = req.requestLogStore;
  if (!store) {
    return;
  }

  const started = req.requestLogStartedAt ?? performance.now();
  const duration_ms = Math.round(performance.now() - started);
  const status_code = resolveStatusCode(req, res);
  const routeError = req.requestLogRouteError;

  const level: LogLevel =
    event === "request.aborted"
      ? "warn"
      : status_code >= 500
        ? "error"
        : status_code >= 400
          ? "warn"
          : "info";

  const message =
    event === "request.aborted"
      ? "Request aborted"
      : status_code >= 400
        ? "Request failed"
        : "Request completed";

  let error: StructuredLogError | null = null;
  const meta: HttpLogMeta & Record<string, unknown> = {
    method: req.method,
    path: requestPathWithoutQuery(req),
    route: store.route_template ?? "",
    status_code,
    duration_ms,
    client_ip: clientIp(req),
    user_agent: req.get("user-agent") ?? "",
    content_length: responseContentLength(req),
    outcome: event
  };

  if (status_code >= 400 && routeError instanceof HttpException) {
    const response = routeError.getResponse();
    meta.error_response =
      typeof response === "object" && response !== null
        ? response
        : { message: response };
    error = {
      name: routeError.name,
      message:
        typeof response === "string" && response.length > 0
          ? response
          : routeError.message,
      stack: status_code >= 500 ? (routeError.stack ?? "") : ""
    };
  } else if (status_code >= 500 && routeError instanceof Error) {
    error = {
      name: routeError.name,
      message: routeError.message,
      stack: routeError.stack ?? ""
    };
  } else if (status_code >= 400 && routeError) {
    meta.error_type =
      routeError instanceof Error ? routeError.name : typeof routeError;
  }

  const user = (req as Request & { user?: { userId: number } }).user;
  store.user_id = user?.userId ?? store.user_id ?? null;

  logger.logHttpAccess({
    level,
    event,
    message,
    correlation_id: store.correlation_id,
    request_id: store.request_id,
    user_id: store.user_id,
    error,
    meta
  });
};

export const createHttpAccessLoggingMiddleware = (
  logger: StructuredLogger
): ((req: Request, res: Response, next: NextFunction) => void) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const request = req as RequestWithLogState;
    const correlation_id = resolveCorrelationId(
      req.headers["x-correlation-id"]
    );
    const request_id = createRequestId();
    const store: RequestLogContextStore = {
      correlation_id,
      request_id,
      user_id: null,
      route_template: ""
    };

    request.requestLogStore = store;
    request.requestLogStartedAt = performance.now();
    request.requestLogAccessLogged = false;

    res.setHeader("x-correlation-id", correlation_id);
    res.setHeader("x-request-id", request_id);

    const logAccess = (
      event: "request.completed" | "request.failed" | "request.aborted"
    ) => {
      buildAccessLog(logger, request, res, event);
    };

    res.on("finish", () => {
      const status = resolveStatusCode(request, res);
      const event = status >= 400 ? "request.failed" : "request.completed";
      logAccess(event);
    });

    res.on("close", () => {
      if (!res.writableFinished) {
        logAccess("request.aborted");
      }
    });

    runWithRequestLogContext(store, () => {
      next();
    });
  };
};
