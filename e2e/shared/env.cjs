const databaseUrl =
  "postgresql://otaku:otaku@127.0.0.1:5432/otaku_corner_e2e";

const apiBaseUrl = "http://127.0.0.1:5000";
const publicBaseUrl = "http://127.0.0.1:3000";
const adminBaseUrl = "http://127.0.0.1:5173";

const backendEnv = {
  NODE_ENV: "test",
  DATABASE_URL: databaseUrl,
  DIRECT_URL: databaseUrl,
  PORT: "5000",
  ACCESS_TOKEN_SECRET: "e2e-access-token-secret",
  REFRESH_TOKEN_SECRET: "e2e-refresh-token-secret",
  ACCESS_TOKEN_DURATION: "15m",
  REFRESH_TOKEN_DURATION: "7d",
  R2_ACCOUNT_ID: "00000000000000000000000000000000",
  R2_PUBLIC_ACCESS_KEY_ID: "e2e-r2-public-access-key",
  R2_PUBLIC_SECRET_ACCESS_KEY: "e2e-r2-public-secret-key",
  R2_PUBLIC_BUCKET_NAME: "e2e-public-bucket",
  R2_PUBLIC_BASE_URL: "https://e2e-r2-public.example.com",
  R2_PRIVATE_ACCESS_KEY_ID: "e2e-r2-private-access-key",
  R2_PRIVATE_SECRET_ACCESS_KEY: "e2e-r2-private-secret-key",
  R2_PRIVATE_BUCKET_NAME: "e2e-private-bucket",
  BULL_REDIS_IP: "127.0.0.1",
  BULL_REDIS_PORT: "6379",
  ADMIN_APP_URL: adminBaseUrl,
  CANONICAL_PUBLIC_APP_URL: publicBaseUrl,
  PUBLIC_APP_URL: publicBaseUrl,
  TENRAI_BASE_URL: "http://127.0.0.1:9",
  LOG_LEVEL: "error",
  LOG_TO_FILE: "false",
  CLOUDFLARE_API_TOKEN: ""
};

const publicEnv = {
  NEXT_PUBLIC_AXIOS_BASE_URL: apiBaseUrl,
  NEXT_PUBLIC_WEBSITE_URL: publicBaseUrl,
  NEXT_PUBLIC_R2_HOSTNAME: "e2e-r2-public.example.com"
};

const adminEnv = {
  VITE_AXIOS_BASE_URL: apiBaseUrl,
  VITE_PUBLIC_APP: publicBaseUrl
};

const applyBackendEnv = () => {
  Object.assign(process.env, backendEnv);
};

module.exports = {
  databaseUrl,
  apiBaseUrl,
  publicBaseUrl,
  adminBaseUrl,
  backendEnv,
  publicEnv,
  adminEnv,
  applyBackendEnv
};
