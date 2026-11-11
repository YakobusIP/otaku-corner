import {
  BadRequestException,
  NotFoundException,
  ServiceUnavailableException
} from "@nestjs/common";

import axios from "axios";

import {
  isRetryableCatalogSyncError,
  shouldPersistCatalogSyncFailure
} from "./catalog-sync-error";

describe("isRetryableCatalogSyncError", () => {
  it("treats not-found errors as terminal", () => {
    expect(isRetryableCatalogSyncError(new NotFoundException("missing"))).toBe(
      false
    );
  });

  it("treats upstream 5xx and rate limits as retryable", () => {
    expect(
      isRetryableCatalogSyncError(new ServiceUnavailableException("down"))
    ).toBe(true);
    expect(
      isRetryableCatalogSyncError(
        axios.AxiosError.from(
          new Error("rate limited"),
          "429",
          undefined,
          undefined,
          {
            status: 429,
            statusText: "Too Many Requests",
            headers: {},
            config: { headers: new axios.AxiosHeaders() },
            data: {}
          }
        )
      )
    ).toBe(true);
  });

  it("treats validation errors as terminal", () => {
    expect(
      isRetryableCatalogSyncError(new BadRequestException("invalid input"))
    ).toBe(false);
  });

  it("treats transient network errors as retryable", () => {
    const error = new Error("socket hang up") as Error & { code: string };
    error.code = "ECONNRESET";
    expect(isRetryableCatalogSyncError(error)).toBe(true);
  });
});

describe("shouldPersistCatalogSyncFailure", () => {
  it("defers persistence for retryable errors before the final attempt", () => {
    const error = new Error("socket hang up") as Error & { code: string };
    error.code = "ECONNRESET";

    expect(shouldPersistCatalogSyncFailure(error, 1, 5)).toBe(false);
    expect(shouldPersistCatalogSyncFailure(error, 5, 5)).toBe(true);
  });

  it("persists terminal validation errors immediately", () => {
    expect(
      shouldPersistCatalogSyncFailure(new BadRequestException("invalid"), 1, 5)
    ).toBe(true);
  });
});
