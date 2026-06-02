const MAX_DEPTH = 12;
const MAX_STRING_LENGTH = 8_192;
const MAX_ARRAY_LENGTH = 100;
const MAX_OBJECT_KEYS = 100;

const truncateString = (value: string): string => {
  if (value.length <= MAX_STRING_LENGTH) {
    return value;
  }
  return `${value.slice(0, MAX_STRING_LENGTH)}...`;
};

const serializeUnknown = (
  value: unknown,
  seen: WeakSet<object>,
  depth: number
): unknown => {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === "bigint") {
    return value.toString();
  }

  if (typeof value === "string") {
    return truncateString(value);
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  if (typeof value === "function") {
    return "[Function]";
  }

  if (typeof value === "symbol") {
    return value.toString();
  }

  if (depth >= MAX_DEPTH) {
    return "[MaxDepth]";
  }

  if (Array.isArray(value)) {
    return value
      .slice(0, MAX_ARRAY_LENGTH)
      .map((entry) => serializeUnknown(entry, seen, depth + 1));
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: truncateString(value.message),
      stack: truncateString(value.stack ?? ""),
      code:
        "code" in value &&
        typeof (value as { code?: unknown }).code === "string"
          ? (value as { code: string }).code
          : undefined
    };
  }

  if (typeof value === "object") {
    if (seen.has(value)) {
      return "[Circular]";
    }
    seen.add(value);

    const record = value as Record<string, unknown>;
    const output: Record<string, unknown> = {};
    const entries = Object.entries(record).slice(0, MAX_OBJECT_KEYS);
    for (const [key, entry] of entries) {
      try {
        output[key] = serializeUnknown(entry, seen, depth + 1);
      } catch {
        output[key] = "[Unserializable]";
      }
    }
    return output;
  }

  return "[Unknown]";
};

export const safeSerializeForLog = (value: unknown): unknown => {
  try {
    return serializeUnknown(value, new WeakSet(), 0);
  } catch {
    return "[Unserializable]";
  }
};
