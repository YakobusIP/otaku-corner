import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "production", "test"]),
    SEED_MODE: z
      .string()
      .transform((value) => value === "true")
      .optional(),
    ENABLE_THROTTLE: z
      .string()
      .transform((value) => value === "true")
      .optional(),
    PORT: z.string().transform((value) => {
      const parsed = parseInt(value, 10);
      if (isNaN(parsed)) throw new Error("Server port must be a number");
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
    GCS_BUCKET_NAME: z.string(),

    GCP_PROJECT_ID: z.string().optional(),
    GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),

    BULL_REDIS_IP: z.string(),
    BULL_REDIS_PORT: z.string().transform((value) => {
      const parsed = parseInt(value, 10);
      if (isNaN(parsed)) throw new Error("Redis port must be a number");
      return parsed;
    }),

    ADMIN_APP_URL: z.string().url(),
    PUBLIC_APP_URL: z.string().url()
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV === "development") {
      if (!env.GCP_PROJECT_ID) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["GCP_PROJECT_ID"],
          message: "GCP_PROJECT_ID is required in development mode"
        });
      }

      if (!env.GOOGLE_APPLICATION_CREDENTIALS) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["GOOGLE_APPLICATION_CREDENTIALS"],
          message:
            "GOOGLE_APPLICATION_CREDENTIALS is required in development mode"
        });
      }
    }
  });

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment variables:", parsedEnv.error.format());
  throw new Error("Invalid environment variables");
}

export const env = parsedEnv.data;
