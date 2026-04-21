import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "staging"])
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

  GCP_PROJECT_ID: z.string().optional(),
  GCS_BUCKET_NAME: z.string().optional(),
  GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),

  BULL_REDIS_IP: z.string().trim().min(1),
  BULL_REDIS_PORT: z.preprocess((v) => {
    if (typeof v !== "string" || v.trim() === "") return 6379;
    return parseInt(v, 10);
  }, z.number().int().positive()),

  ADMIN_APP_URL: z.url().trim(),
  CANONICAL_PUBLIC_APP_URL: z.url().trim(),
  PUBLIC_APP_URL: z.url().trim(),

  UPLOADS_DIR: z.string().optional(),

  LOG_SERVICE_NAME: z.string().trim().min(1).optional(),
  LOG_LEVEL: z.preprocess(
    (v) => {
      if (typeof v !== "string" || v.trim() === "") {
        return "info";
      }
      return v.trim().toLowerCase();
    },
    z.enum(["error", "warn", "info", "debug"])
  ),
  LOG_TO_STDOUT: z.preprocess((v) => {
    if (typeof v !== "string" || v.trim() === "") {
      return true;
    }
    const normalized = v.trim().toLowerCase();
    if (normalized === "true") {
      return true;
    }
    if (normalized === "false") {
      return false;
    }
    return v;
  }, z.boolean())
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
