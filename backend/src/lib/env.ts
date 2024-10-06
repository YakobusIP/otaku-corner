import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().transform((value) => {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) throw new Error("Port must be a number");
    return parsed;
  }),
  MAX_FILE_SIZE: z.string().transform((value) => {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) throw new Error("Max file size must be a number");
    return parsed;
  }),
  LOCAL_UPLOAD_PATH: z.string(),
  RELATIVE_LOCAL_UPLOAD_PATH: z.string(),
  GCP_PROJECT_ID: z.string(),
  GCS_BUCKET_NAME: z.string(),
  GOOGLE_APPLICATION_CREDENTIALS: z.string(),
  NODE_ENV: z.enum(["development", "production", "test"])
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment variables:", parsedEnv.error.format());
  throw new Error("Invalid environment variables");
}

export const env = parsedEnv.data;
