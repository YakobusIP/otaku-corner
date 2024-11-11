import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  SEED_MODE: z.string().transform((value) => value === "true"),
  ENABLE_THROTTLE: z.string().transform((value) => value === "true"),
  PORT: z.string().transform((value) => {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) throw new Error("Port must be a number");
    return parsed;
  }),
  ACCESS_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_DURATION: z.string(),
  REFRESH_TOKEN_DURATION: z.string(),

  MAX_FILE_SIZE: z.string().transform((value) => {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) throw new Error("Max file size must be a number");
    return parsed;
  }),
  LOCAL_UPLOAD_PATH: z.string(),
  RELATIVE_LOCAL_UPLOAD_PATH: z.string(),
  GCP_PROJECT_ID: z.string(),
  GCS_BUCKET_NAME: z.string(),
  GOOGLE_APPLICATION_CREDENTIALS: z.string()
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment variables:", parsedEnv.error.format());
  throw new Error("Invalid environment variables");
}

export const env = parsedEnv.data;
