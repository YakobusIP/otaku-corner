import { safeSerializeForLog } from "@/common/logging/safe-serialize";

const REDACTED = "[REDACTED]";

const normalizeKey = (key: string): string =>
  key.toLowerCase().replace(/[^a-z0-9]/g, "");

const SENSITIVE_NORMALIZED_KEYS = new Set([
  "authorization",
  "cookie",
  "setcookie",
  "accesstoken",
  "refreshtoken",
  "token",
  "jwt",
  "secret",
  "password",
  "pin",
  "pin1",
  "pin2",
  "apikey",
  "accesskey",
  "secretaccesskey",
  "uploadurl",
  "presignedurl"
]);

const isSensitiveKey = (key: string): boolean => {
  const normalized = normalizeKey(key);
  if (SENSITIVE_NORMALIZED_KEYS.has(normalized)) {
    return true;
  }
  if (/^pin\d+$/.test(normalized)) {
    return true;
  }
  if (
    normalized.endsWith("accesstoken") ||
    normalized.endsWith("refreshtoken") ||
    normalized.endsWith("secretaccesskey")
  ) {
    return true;
  }
  if (normalized.includes("presignedurl") || normalized.includes("uploadurl")) {
    return true;
  }
  if (normalized.endsWith("apikey") || normalized.endsWith("accesskey")) {
    return true;
  }
  return false;
};

const redactUnknown = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((entry) => redactUnknown(entry));
  }
  if (value !== null && typeof value === "object") {
    return redactObject(value as Record<string, unknown>);
  }
  return value;
};

export const redactObject = (
  value: Record<string, unknown>
): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (isSensitiveKey(key)) {
      result[key] = REDACTED;
      continue;
    }
    result[key] = redactUnknown(entry);
  }
  return result;
};

export const redactStructuredLogLine = <T extends Record<string, unknown>>(
  line: T
): T => {
  const redacted = { ...line } as Record<string, unknown>;

  if (line.error !== null && line.error !== undefined) {
    redacted.error = redactObject(
      safeSerializeForLog(line.error) as Record<string, unknown>
    );
  }

  if (line.meta !== null && line.meta !== undefined) {
    redacted.meta = redactObject(
      safeSerializeForLog(line.meta) as Record<string, unknown>
    );
  }

  return redacted as T;
};

export const buildPinoRedactPaths = (): string[] => {
  const leafKeys = [
    "authorization",
    "cookie",
    "set-cookie",
    "setCookie",
    "access_token",
    "accessToken",
    "refresh_token",
    "refreshToken",
    "token",
    "jwt",
    "secret",
    "password",
    "pin",
    "pin1",
    "pin2",
    "api_key",
    "apiKey",
    "access_key",
    "accessKey",
    "secret_access_key",
    "secretAccessKey",
    "upload_url",
    "uploadUrl",
    "presigned_url",
    "presignedUrl"
  ];
  const prefixes = ["", "meta.", "error.", "meta.headers.", "headers."];
  const paths: string[] = [];
  for (const prefix of prefixes) {
    for (const leaf of leafKeys) {
      paths.push(`${prefix}${leaf}`);
    }
  }
  return paths;
};
