import { validateEnv } from "./validate-env";

function minimalValidEnv(
  overrides: Record<string, unknown> = {}
): Record<string, unknown> {
  return {
    DATABASE_URL: "postgresql://fake:fake@localhost:5432/fake_db",
    DIRECT_URL: "postgresql://fake:fake@localhost:5432/fake_db",
    ACCESS_TOKEN_SECRET: "fake-access-token-secret",
    REFRESH_TOKEN_SECRET: "fake-refresh-token-secret",
    R2_ACCOUNT_ID: "00000000000000000000000000000000",
    R2_PUBLIC_ACCESS_KEY_ID: "fake-r2-public-access-key-id",
    R2_PUBLIC_SECRET_ACCESS_KEY: "fake-r2-public-secret-access-key",
    R2_PUBLIC_BUCKET_NAME: "fake-public-bucket",
    R2_PUBLIC_BASE_URL: "https://fake-r2-public.example.com",
    R2_PRIVATE_ACCESS_KEY_ID: "fake-r2-private-access-key-id",
    R2_PRIVATE_SECRET_ACCESS_KEY: "fake-r2-private-secret-access-key",
    R2_PRIVATE_BUCKET_NAME: "fake-private-bucket",
    BULL_REDIS_IP: "127.0.0.1",
    ADMIN_APP_URL: "https://admin.fake.example",
    CANONICAL_PUBLIC_APP_URL: "https://www.fake.example",
    PUBLIC_APP_URL: "https://app.fake.example",
    ...overrides
  };
}

const expectInvalidEnv = (overrides: Record<string, unknown>): void => {
  expect(() => validateEnv(minimalValidEnv(overrides))).toThrow(
    /Environment validation failed/
  );
};

describe("validateEnv", () => {
  it("accepts a minimal valid config and applies NODE_ENV default", () => {
    const env = validateEnv(minimalValidEnv());

    expect(env.NODE_ENV).toBe("development");
  });

  it("defaults ACCESS and REFRESH token durations when omitted", () => {
    const env = validateEnv(minimalValidEnv());

    expect(env.ACCESS_TOKEN_DURATION).toBe("15m");
    expect(env.REFRESH_TOKEN_DURATION).toBe("7d");
  });

  it("defaults PORT to 5000 when empty or not a number", () => {
    expect(validateEnv(minimalValidEnv({ PORT: "" })).PORT).toBe(5000);
    expect(validateEnv(minimalValidEnv({ PORT: "   " })).PORT).toBe(5000);
    expect(validateEnv(minimalValidEnv({ PORT: "not-a-port" })).PORT).toBe(
      5000
    );
  });

  it("defaults MAX_FILE_SIZE to 52_428_800 when empty or not a number", () => {
    expect(
      validateEnv(minimalValidEnv({ MAX_FILE_SIZE: "" })).MAX_FILE_SIZE
    ).toBe(52_428_800);
    expect(
      validateEnv(minimalValidEnv({ MAX_FILE_SIZE: "invalid" })).MAX_FILE_SIZE
    ).toBe(52_428_800);
  });

  it("rejects missing required database connection URLs", () => {
    expectInvalidEnv({ DATABASE_URL: "" });
    expectInvalidEnv({ DIRECT_URL: "   " });
  });

  it("rejects missing JWT secrets", () => {
    expectInvalidEnv({ ACCESS_TOKEN_SECRET: "" });
    expectInvalidEnv({ REFRESH_TOKEN_SECRET: "" });
  });

  it("rejects missing required R2 identifier and credential strings", () => {
    expectInvalidEnv({ R2_ACCOUNT_ID: "" });
    expectInvalidEnv({ R2_PUBLIC_ACCESS_KEY_ID: "" });
    expectInvalidEnv({ R2_PRIVATE_BUCKET_NAME: "" });
  });

  it("rejects PORT values outside the allowed TCP port range", () => {
    expectInvalidEnv({ PORT: "0" });
    expectInvalidEnv({ PORT: "65536" });
  });

  it("accepts a valid R2 public base URL and rejects a non-URL value", () => {
    expect(
      validateEnv(
        minimalValidEnv({ R2_PUBLIC_BASE_URL: "https://cdn.fake.example/path" })
      ).R2_PUBLIC_BASE_URL
    ).toBe("https://cdn.fake.example/path");

    expectInvalidEnv({ R2_PUBLIC_BASE_URL: "not-a-url" });
  });

  it("rejects invalid app URL fields enforced by z.url()", () => {
    expectInvalidEnv({ ADMIN_APP_URL: "not-a-url" });
    expectInvalidEnv({ PUBLIC_APP_URL: "" });
  });

  it("omits CLOUDFLARE_API_TOKEN when blank and accepts a trimmed non-empty value", () => {
    expect(
      validateEnv(minimalValidEnv({ CLOUDFLARE_API_TOKEN: "" }))
        .CLOUDFLARE_API_TOKEN
    ).toBeUndefined();
    expect(
      validateEnv(minimalValidEnv({ CLOUDFLARE_API_TOKEN: "  fake-token  " }))
        .CLOUDFLARE_API_TOKEN
    ).toBe("fake-token");
  });

  it("defaults TENRAI_BASE_URL and strips trailing slashes from a custom value", () => {
    expect(validateEnv(minimalValidEnv()).TENRAI_BASE_URL).toBe(
      "https://api.tenrai.org/v1"
    );
    expect(
      validateEnv(
        minimalValidEnv({ TENRAI_BASE_URL: "https://tenrai.fake.example///" })
      ).TENRAI_BASE_URL
    ).toBe("https://tenrai.fake.example");
  });

  it("applies logging preprocess defaults and normalizes LOG_LEVEL", () => {
    const env = validateEnv(minimalValidEnv());
    expect(env.LOG_SERVICE_NAME).toBe("backend-nest");
    expect(env.LOG_LEVEL).toBe("info");
    expect(env.LOG_TO_FILE).toBe(false);

    expect(validateEnv(minimalValidEnv({ LOG_LEVEL: "DEBUG" })).LOG_LEVEL).toBe(
      "debug"
    );
  });

  it("rejects LOG_LEVEL outside the allowed enum", () => {
    expectInvalidEnv({ LOG_LEVEL: "trace" });
  });

  it("parses LOG_TO_FILE from true/false strings and rejects other values", () => {
    expect(
      validateEnv(minimalValidEnv({ LOG_TO_FILE: "true" })).LOG_TO_FILE
    ).toBe(true);
    expect(
      validateEnv(minimalValidEnv({ LOG_TO_FILE: "FALSE" })).LOG_TO_FILE
    ).toBe(false);
    expectInvalidEnv({ LOG_TO_FILE: "yes" });
  });

  it("defaults DB_SLOW_QUERY_THRESHOLD_MS and rejects non-digit values", () => {
    expect(validateEnv(minimalValidEnv()).DB_SLOW_QUERY_THRESHOLD_MS).toBe(250);
    expectInvalidEnv({ DB_SLOW_QUERY_THRESHOLD_MS: "250ms" });
  });

  it("defaults BULL_REDIS_PORT when empty and rejects a non-numeric port", () => {
    expect(validateEnv(minimalValidEnv()).BULL_REDIS_PORT).toBe(6379);
    expect(
      validateEnv(minimalValidEnv({ BULL_REDIS_PORT: "" })).BULL_REDIS_PORT
    ).toBe(6379);
    expectInvalidEnv({ BULL_REDIS_PORT: "not-a-port" });
  });
});
