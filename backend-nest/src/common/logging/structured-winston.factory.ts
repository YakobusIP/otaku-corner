import { mkdirSync } from "fs";
import { join } from "path";
import type { Logger as WinstonLoggerType } from "winston";
import winston from "winston";

export const STRUCTURED_WINSTON = Symbol("STRUCTURED_WINSTON");

export type StructuredWinstonOptions = {
  logDir: string;
  filename: string;
  level: "error" | "warn" | "info" | "debug";
  logToStdout: boolean;
};

export function createStructuredWinstonLogger(
  options: StructuredWinstonOptions
): WinstonLoggerType {
  mkdirSync(options.logDir, { recursive: true });
  const filePath = join(options.logDir, options.filename);
  const lineFormatter = winston.format.printf((info) => {
    const msg = info.message;
    if (typeof msg === "string") {
      return msg;
    }
    return JSON.stringify(msg);
  });
  const transports: winston.transport[] = [
    new winston.transports.File({
      filename: filePath,
      format: lineFormatter
    })
  ];

  if (options.logToStdout) {
    transports.push(
      new winston.transports.Console({
        format: lineFormatter
      })
    );
  }

  return winston.createLogger({
    silent: false,
    level: options.level,
    transports
  });
}
