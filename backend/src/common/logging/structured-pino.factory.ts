import { mkdirSync } from "node:fs";
import { join } from "node:path";

import {
  buildPinoRedactPaths,
  redactStructuredLogLine
} from "@/common/logging/log-redaction";
import { safeSerializeForLog } from "@/common/logging/safe-serialize";
import type {
  LogLevel,
  StructuredLogError,
  StructuredLogLine
} from "@/common/logging/structured-log.types";

import pino from "pino";
import type { DestinationStream } from "pino";

export const STRUCTURED_LOGGER_BACKEND = Symbol("STRUCTURED_LOGGER_BACKEND");

export type StructuredLoggerBackend = {
  write(line: StructuredLogLine): void;
  flush(callback?: () => void): void;
  flushSync(): void;
  final(callback: (error?: Error) => void): void;
};

export type StructuredPinoOptions = {
  level: LogLevel | "debug" | "info" | "warn" | "error";
  logToFile: boolean;
  logDir: string;
  filename: string;
};

const appLevelToPinoMethod = (
  level: LogLevel
): "debug" | "info" | "warn" | "error" | "fatal" => {
  if (level === "fatal") {
    return "fatal";
  }
  return level;
};

const prepareLineForPino = (line: StructuredLogLine): StructuredLogLine => {
  const redacted = redactStructuredLogLine(line);
  return {
    ...redacted,
    meta: safeSerializeForLog(redacted.meta) as Record<string, unknown>,
    error: redacted.error
      ? (safeSerializeForLog(redacted.error) as StructuredLogError)
      : null
  };
};

const stripPinoManagedFields = (
  line: StructuredLogLine
): Omit<StructuredLogLine, "level"> => {
  const { level: _level, ...lineWithoutLevel } = line;
  return lineWithoutLevel;
};

const buildDegradedLogLine = (
  line: StructuredLogLine,
  emitError: unknown
): StructuredLogLine => ({
  timestamp: new Date().toISOString(),
  level: "error",
  service: line.service,
  environment: line.environment,
  context: "application",
  event: "log.emit_failed",
  message: "Failed to emit structured log line",
  correlation_id: line.correlation_id,
  request_id: line.request_id,
  user_id: line.user_id,
  error:
    emitError instanceof Error
      ? {
          name: emitError.name,
          message: emitError.message,
          stack: emitError.stack ?? ""
        }
      : {
          name: "Error",
          message: String(emitError),
          stack: ""
        },
  meta: {
    original_context: line.context,
    original_event: line.event
  }
});

const flushDestinationSync = (destination: DestinationStream): void => {
  const stream = destination as DestinationStream & {
    flushSync?: () => void;
  };
  if (typeof stream.flushSync === "function") {
    stream.flushSync();
  }
};

export function createStructuredPinoBackend(
  options: StructuredPinoOptions
): StructuredLoggerBackend {
  const stdoutDestination = pino.destination({
    dest: 1,
    sync: false,
    minLength: 0
  });

  const destinations: DestinationStream[] = [stdoutDestination];
  let fileDestination: DestinationStream | undefined;

  if (options.logToFile) {
    mkdirSync(options.logDir, { recursive: true });
    const filePath = join(options.logDir, options.filename);
    fileDestination = pino.destination({
      dest: filePath,
      sync: false,
      mkdir: true,
      minLength: 0
    });
    destinations.push(fileDestination);
  }

  const destination =
    destinations.length === 1
      ? destinations[0]
      : pino.multistream(
          destinations.map((stream) => ({
            stream,
            level: options.level as pino.Level
          }))
        );

  const pinoLogger = pino(
    {
      level: options.level,
      timestamp: false,
      base: null,
      messageKey: "message",
      redact: {
        paths: buildPinoRedactPaths(),
        censor: "[REDACTED]",
        remove: false
      },
      formatters: {
        level(label) {
          return { level: label };
        },
        bindings() {
          return {};
        }
      },
      serializers: {
        meta(value: unknown) {
          return safeSerializeForLog(value);
        },
        error(value: unknown) {
          return safeSerializeForLog(value);
        }
      }
    },
    destination
  );

  const write = (line: StructuredLogLine): void => {
    try {
      const prepared = prepareLineForPino(line);
      const method = appLevelToPinoMethod(prepared.level);
      if (!pinoLogger.isLevelEnabled(method)) {
        return;
      }
      pinoLogger[method](stripPinoManagedFields(prepared));
    } catch (emitError: unknown) {
      try {
        const degraded = prepareLineForPino(
          buildDegradedLogLine(line, emitError)
        );
        pinoLogger.error(stripPinoManagedFields(degraded));
      } catch {
        process.stdout.write(
          `${JSON.stringify({
            timestamp: new Date().toISOString(),
            level: "error",
            context: "application",
            event: "log.emit_failed",
            message: "Structured log emit failed twice"
          })}\n`
        );
      }
    }
  };

  const flush = (callback?: () => void): void => {
    pinoLogger.flush(callback);
  };

  const flushSync = (): void => {
    flushDestinationSync(destination);
    if (fileDestination !== undefined) {
      flushDestinationSync(fileDestination);
    }
  };

  const final = (callback: (error?: Error) => void): void => {
    try {
      pinoLogger.flush((flushError?: Error) => {
        if (flushError) {
          callback(flushError);
          return;
        }
        flushSync();
        callback();
      });
    } catch (error: unknown) {
      callback(error instanceof Error ? error : new Error(String(error)));
    }
  };

  return {
    write,
    flush,
    flushSync,
    final
  };
}
