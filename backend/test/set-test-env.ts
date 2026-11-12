const databaseUrl =
  process.env.E2E_DATABASE_URL ??
  `postgresql://${process.env.USER ?? "postgres"}@127.0.0.1:5432/otaku_corner_e2e`;

process.env.NODE_ENV = "test";
process.env.DATABASE_URL = databaseUrl;
process.env.DIRECT_URL = databaseUrl;
process.env.ACCESS_TOKEN_SECRET = "e2e-access-token-secret";
process.env.REFRESH_TOKEN_SECRET = "e2e-refresh-token-secret";
process.env.ACCESS_TOKEN_DURATION = "15m";
process.env.REFRESH_TOKEN_DURATION = "7d";
process.env.R2_ACCOUNT_ID = "00000000000000000000000000000000";
process.env.R2_PUBLIC_ACCESS_KEY_ID = "e2e-r2-public-access-key";
process.env.R2_PUBLIC_SECRET_ACCESS_KEY = "e2e-r2-public-secret-key";
process.env.R2_PUBLIC_BUCKET_NAME = "e2e-public-bucket";
process.env.R2_PUBLIC_BASE_URL = "https://e2e-r2-public.example.com";
process.env.R2_PRIVATE_ACCESS_KEY_ID = "e2e-r2-private-access-key";
process.env.R2_PRIVATE_SECRET_ACCESS_KEY = "e2e-r2-private-secret-key";
process.env.R2_PRIVATE_BUCKET_NAME = "e2e-private-bucket";
process.env.BULL_REDIS_IP = "127.0.0.1";
process.env.BULL_REDIS_PORT = process.env.E2E_REDIS_PORT ?? "63799";
process.env.ADMIN_APP_URL = "https://admin.e2e.example";
process.env.CANONICAL_PUBLIC_APP_URL = "https://www.e2e.example";
process.env.PUBLIC_APP_URL = "https://app.e2e.example";
process.env.TENRAI_BASE_URL = "https://tenrai.e2e.example/v1";
process.env.LOG_LEVEL = "error";
process.env.LOG_TO_FILE = "false";
process.env.CLOUDFLARE_API_TOKEN = "";
