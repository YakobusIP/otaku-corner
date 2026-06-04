import type { StructuredLogError } from "@/common/logging/structured-log.types";
import type { StructuredLogger } from "@/common/logging/structured-logger.service";

const errorFromUnknown = (error: unknown): StructuredLogError => {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack ?? "",
      code:
        "code" in error &&
        typeof (error as { code?: unknown }).code === "string"
          ? (error as { code: string }).code
          : undefined
    };
  }
  return {
    name: "Error",
    message: String(error),
    stack: ""
  };
};

export const registerProcessLifecycleLogging = (
  logger: StructuredLogger
): void => {
  process.on("warning", (warning) => {
    logger.logProcess({
      level: "warn",
      event: "process.warning",
      message: "Process warning",
      error: {
        name: warning.name,
        message: warning.message,
        stack: warning.stack ?? ""
      },
      meta: {
        warning_name: warning.name
      }
    });
  });

  process.on("unhandledRejection", (reason) => {
    logger.logProcess({
      level: "error",
      event: "process.unhandled_rejection",
      message: "Unhandled promise rejection",
      error: errorFromUnknown(reason),
      meta: {}
    });
    logger.flushSync();
  });

  process.on("uncaughtException", (error) => {
    logger.logProcess({
      level: "fatal",
      event: "process.uncaught_exception",
      message: "Uncaught exception",
      error: errorFromUnknown(error),
      meta: {}
    });
    logger.flushSync();
    process.exit(1);
  });
};

export const logProcessShutdown = (
  logger: StructuredLogger,
  phase: "started" | "completed"
): void => {
  logger.logProcess({
    level: "info",
    event:
      phase === "started"
        ? "process.shutdown.started"
        : "process.shutdown.completed",
    message:
      phase === "started"
        ? "Process shutdown started"
        : "Process shutdown completed",
    meta: {}
  });
};
