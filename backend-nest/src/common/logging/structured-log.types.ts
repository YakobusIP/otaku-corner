export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogEnvironment = "development" | "staging" | "production" | "test";

export type LogContext =
  | "http"
  | "queue"
  | "cron"
  | "http_client"
  | "application";

export type StructuredLogError = {
  name: string;
  message: string;
  stack: string;
};

export type HttpLogMeta = {
  method: string;
  path: string;
  route: string;
  status_code: number;
  duration_ms: number;
  client_ip: string;
  user_agent: string;
};

export type QueueLogMeta = {
  queue_name: string;
  job_id: string;
  job_name: string;
  attempt: number;
  max_attempts: number;
  duration_ms: number | null;
};

export type StructuredLogLine = {
  timestamp: string;
  level: LogLevel;
  service: string;
  environment: LogEnvironment;
  context: LogContext;
  event: string;
  message: string;
  correlation_id: string | null;
  request_id: string | null;
  user_id: string | number | null;
  error: StructuredLogError | null;
  meta: Record<string, unknown>;
};
