import type { StructuredLogError } from "@/common/logging/structured-log.types";
import type { StructuredLogger } from "@/common/logging/structured-logger.service";

import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse
} from "axios";

export type HttpClientProvider = "jikan" | "anilist" | "ranobedb";

export type HttpClientLogContext = {
  provider: HttpClientProvider;
  method: string;
  endpoint: string;
  correlation_id?: string;
  request_id?: string | null;
  queue_name?: string;
  job_id?: string | null;
  job_name?: string;
};

const errorFromUnknown = (error: unknown): StructuredLogError => {
  if (axios.isAxiosError(error)) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack ?? "",
      code: error.code
    };
  }
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack ?? ""
    };
  }
  return {
    name: "Error",
    message: String(error),
    stack: ""
  };
};

const baseMeta = (context: HttpClientLogContext): Record<string, unknown> => ({
  provider: context.provider,
  method: context.method,
  endpoint: context.endpoint,
  ...(context.queue_name !== undefined
    ? { queue_name: context.queue_name }
    : {}),
  ...(context.job_id !== undefined ? { job_id: context.job_id } : {}),
  ...(context.job_name !== undefined ? { job_name: context.job_name } : {})
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const getHeaderValue = (headers: unknown, name: string): unknown => {
  if (!isRecord(headers)) {
    return undefined;
  }
  const target = name.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === target) {
      return value;
    }
  }
  return undefined;
};

const parseRetryAfterHeader = (rawHeader: unknown): number | null => {
  if (typeof rawHeader === "string") {
    const parsed = Number.parseInt(rawHeader, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }
  if (typeof rawHeader === "number" && Number.isFinite(rawHeader)) {
    return Math.trunc(rawHeader);
  }
  if (Array.isArray(rawHeader) && typeof rawHeader[0] === "string") {
    const parsed = Number.parseInt(rawHeader[0], 10);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const retryAfterSeconds = (error: AxiosError): number | null =>
  parseRetryAfterHeader(getHeaderValue(error.response?.headers, "retry-after"));

export const loggedAxiosRequest = async <T>(
  logger: StructuredLogger,
  context: HttpClientLogContext,
  config: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  const started = performance.now();
  logger.logHttpClient({
    level: "debug",
    event: "http_client.request.started",
    message: "Outbound HTTP request started",
    correlation_id: context.correlation_id,
    request_id: context.request_id,
    meta: baseMeta(context)
  });

  try {
    const response = await axios.request<T>(config);
    const duration_ms = Math.round(performance.now() - started);
    logger.logHttpClient({
      level: "info",
      event: "http_client.request.completed",
      message: "Outbound HTTP request completed",
      correlation_id: context.correlation_id,
      request_id: context.request_id,
      meta: {
        ...baseMeta(context),
        status_code: response.status,
        duration_ms
      }
    });
    return response;
  } catch (error: unknown) {
    const duration_ms = Math.round(performance.now() - started);
    const axiosError = axios.isAxiosError(error) ? error : undefined;
    const statusCode = axiosError?.response?.status;
    const retryAfter =
      axiosError !== undefined ? retryAfterSeconds(axiosError) : null;

    if (statusCode === 429) {
      logger.logHttpClient({
        level: "warn",
        event: "http_client.request.rate_limited",
        message: "Outbound HTTP request rate limited",
        correlation_id: context.correlation_id,
        request_id: context.request_id,
        error: errorFromUnknown(error),
        meta: {
          ...baseMeta(context),
          status_code: statusCode,
          duration_ms,
          ...(retryAfter !== null ? { retry_after_seconds: retryAfter } : {})
        }
      });
    }

    logger.logHttpClient({
      level: "error",
      event: "http_client.request.failed",
      message: "Outbound HTTP request failed",
      correlation_id: context.correlation_id,
      request_id: context.request_id,
      error: errorFromUnknown(error),
      meta: {
        ...baseMeta(context),
        status_code: statusCode ?? null,
        duration_ms,
        ...(retryAfter !== null ? { retry_after_seconds: retryAfter } : {})
      }
    });
    throw error;
  }
};
