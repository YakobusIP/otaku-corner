import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  DATABASE_URL: z.string().trim().min(1),
  DIRECT_URL: z.string().trim().min(1),

  SEED_MODE: z.string().optional(),
  ENABLE_THROTTLE: z.string().optional(),

  PORT: z.preprocess((v) => {
    if (typeof v !== "string" || v.trim() === "") return 5000;
    const n = parseInt(v, 10);
    return Number.isNaN(n) ? 5000 : n;
  }, z.number().int().min(1).max(65535)),

  ACCESS_TOKEN_SECRET: z.string().trim().min(1),
  REFRESH_TOKEN_SECRET: z.string().trim().min(1),
  ACCESS_TOKEN_DURATION: z.string().default("15m"),
  REFRESH_TOKEN_DURATION: z.string().default("7d"),

  MAX_FILE_SIZE: z.preprocess((v) => {
    if (typeof v !== "string" || v.trim() === "") return 52_428_800;
    const n = parseInt(v, 10);
    return Number.isNaN(n) ? 52_428_800 : n;
  }, z.number().int().positive()),

  R2_ACCOUNT_ID: z.string().trim().min(1),
  R2_PUBLIC_ACCESS_KEY_ID: z.string().trim().min(1),
  R2_PUBLIC_SECRET_ACCESS_KEY: z.string().trim().min(1),
  R2_PUBLIC_BUCKET_NAME: z.string().trim().min(1),
  R2_PUBLIC_BASE_URL: z
    .string()
    .trim()
    .min(1)
    .superRefine((value, ctx) => {
      try {
        new URL(value);
      } catch {
        ctx.addIssue({
          code: "custom",
          message: "Must be a valid URL"
        });
      }
    }),
  R2_PRIVATE_ACCESS_KEY_ID: z.string().trim().min(1),
  R2_PRIVATE_SECRET_ACCESS_KEY: z.string().trim().min(1),
  R2_PRIVATE_BUCKET_NAME: z.string().trim().min(1),

  BULL_REDIS_IP: z.string().trim().min(1),
  BULL_REDIS_PORT: z.preprocess((v) => {
    if (typeof v !== "string" || v.trim() === "") return 6379;
    return parseInt(v, 10);
  }, z.number().int().positive()),

  ADMIN_APP_URL: z.url().trim(),
  CANONICAL_PUBLIC_APP_URL: z.url().trim(),
  PUBLIC_APP_URL: z.url().trim(),

  LOG_SERVICE_NAME: z.preprocess((v) => {
    if (typeof v !== "string" || v.trim() === "") {
      return "backend-nest";
    }
    return v.trim();
  }, z.string().trim().min(1)),
  LOG_LEVEL: z.preprocess(
    (v) => {
      if (typeof v !== "string" || v.trim() === "") {
        return "info";
      }
      return v.trim().toLowerCase();
    },
    z.enum(["error", "warn", "info", "debug"])
  ),
  LOG_TO_FILE: z.preprocess((v) => {
    if (typeof v !== "string" || v.trim() === "") {
      return false;
    }
    const normalized = v.trim().toLowerCase();
    if (normalized === "true") {
      return true;
    }
    if (normalized === "false") {
      return false;
    }
    return v;
  }, z.boolean()),

  DB_SLOW_QUERY_THRESHOLD_MS: z.preprocess((v) => {
    if (typeof v !== "string" || v.trim() === "") {
      return 250;
    }
    const trimmed = v.trim();
    if (!/^\d+$/.test(trimmed)) {
      return Number.NaN;
    }
    return Number(trimmed);
  }, z.number().int().positive())
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    const flat = z.flattenError(result.error);
    throw new Error(
      `Environment validation failed:\n${JSON.stringify(flat, null, 2)}`
    );
  }
  return result.data;
}
