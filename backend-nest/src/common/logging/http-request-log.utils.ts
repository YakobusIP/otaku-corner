import type { Request } from "express";
import {
  validate as uuidValidate,
  version as uuidVersion,
  v4 as uuidv4
} from "uuid";

export const GLOBAL_API_PREFIX = "api";

export const parseCorrelationHeader = (value: unknown): string | undefined => {
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
};

export const resolveCorrelationId = (headerValue: unknown): string => {
  return parseCorrelationHeader(headerValue) ?? uuidv4();
};

export const createRequestId = (): string => uuidv4();

export const clientIp = (req: Request): string => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0]?.trim() ?? "";
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    return forwarded[0].split(",")[0]?.trim() ?? "";
  }
  return req.ip ?? req.socket.remoteAddress ?? "";
};

export const requestPathWithoutQuery = (req: Request): string => {
  return (req.originalUrl ?? req.url ?? "").split("?")[0] ?? "";
};

export const responseContentLength = (req: Request): number | null => {
  const header = req.res?.getHeader("content-length");
  if (typeof header === "string") {
    const parsed = Number.parseInt(header, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }
  if (typeof header === "number" && Number.isFinite(header)) {
    return header;
  }
  return null;
};
