export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

export type LogEnvironment = "development" | "test" | "production";

export type LogContext =
  | "http"
  | "queue"
  | "application"
  | "db"
  | "storage"
  | "http_client"
  | "process"
  | "auth";

export type StructuredLogError = {
  name: string;
  message: string;
  stack: string;
  code?: string;
};

export type HttpLogMeta = {
  method: string;
  path: string;
  route: string;
  status_code: number;
  duration_ms: number;
  client_ip: string;
  user_agent: string;
  content_length?: number | null;
  outcome?: string;
};

export type QueueLogMeta = {
  queue_name: string;
  job_id: string | null;
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
