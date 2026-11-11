import {
  HttpException,
  NotFoundException,
  RequestTimeoutException,
  ServiceUnavailableException
} from "@nestjs/common";

import axios from "axios";

const RETRYABLE_NODE_ERROR_CODES = new Set([
  "ECONNABORTED",
  "ECONNREFUSED",
  "ECONNRESET",
  "EAI_AGAIN",
  "ENETUNREACH",
  "ENOTFOUND",
  "ETIMEDOUT"
]);

const isRetryableHttpStatus = (status: number): boolean =>
  status === 408 || status === 429 || status >= 500;

export const isRetryableCatalogSyncError = (error: unknown): boolean => {
  if (
    error instanceof NotFoundException ||
    error instanceof RequestTimeoutException ||
    error instanceof ServiceUnavailableException
  ) {
    return error instanceof NotFoundException ? false : true;
  }

  if (error instanceof HttpException) {
    return isRetryableHttpStatus(error.getStatus());
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status !== undefined) {
      return isRetryableHttpStatus(status);
    }
    if (error.code && RETRYABLE_NODE_ERROR_CODES.has(error.code)) {
      return true;
    }
  }

  if (error instanceof Error) {
    const errorCode = (error as Error & { code?: unknown }).code;
    if (
      typeof errorCode === "string" &&
      RETRYABLE_NODE_ERROR_CODES.has(errorCode)
    ) {
      return true;
    }
  }

  return false;
};

export const shouldPersistCatalogSyncFailure = (
  error: unknown,
  attempt: number,
  maxAttempts: number
): boolean => !isRetryableCatalogSyncError(error) || attempt >= maxAttempts;
