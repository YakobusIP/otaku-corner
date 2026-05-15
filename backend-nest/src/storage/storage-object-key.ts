import { BadRequestException } from "@nestjs/common";

const MAX_OBJECT_KEY_LENGTH = 1024;
const SAFE_SEGMENT = /^[A-Za-z0-9][A-Za-z0-9._~-]*$/;

export const assertSafeObjectStorageKey = (key: string): void => {
  if (!key || key.length > MAX_OBJECT_KEY_LENGTH) {
    throw new BadRequestException("Invalid storage key");
  }
  if (key.startsWith("/") || key.startsWith("\\") || key.endsWith("/")) {
    throw new BadRequestException("Invalid storage key");
  }
  for (const segment of key.split("/")) {
    if (!segment || segment === "." || segment === "..") {
      throw new BadRequestException("Invalid storage key");
    }
    if (!SAFE_SEGMENT.test(segment)) {
      throw new BadRequestException("Invalid storage key");
    }
  }
};
