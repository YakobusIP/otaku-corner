import { BadRequestException } from "@nestjs/common";

export type DetectedImageFormat = "jpeg" | "png" | "gif" | "webp";

const EXT_BY_FORMAT: Record<DetectedImageFormat, string> = {
  jpeg: ".jpg",
  png: ".png",
  gif: ".gif",
  webp: ".webp"
};

const MIME_BY_FORMAT: Record<DetectedImageFormat, string> = {
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp"
};

export const detectImageFormatFromBuffer = (
  buffer: Buffer
): DetectedImageFormat | null => {
  if (buffer.length < 12) {
    return null;
  }
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "jpeg";
  }
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "png";
  }
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38
  ) {
    return "gif";
  }
  if (
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "webp";
  }
  return null;
};

export const fileExtensionForDetectedImageFormat = (
  format: DetectedImageFormat
): string => EXT_BY_FORMAT[format];

export const mimeTypeForDetectedImageFormat = (
  format: DetectedImageFormat
): string => MIME_BY_FORMAT[format];

export const assertDeclaredMimeMatchesImageBuffer = (
  declaredMime: string | undefined,
  format: DetectedImageFormat
): void => {
  const expected = MIME_BY_FORMAT[format];
  const mime = (declaredMime ?? "").trim().toLowerCase();
  if (!mime || mime === "application/octet-stream") {
    return;
  }
  if (mime === expected) {
    return;
  }
  if (format === "jpeg" && (mime === "image/jpg" || mime === "image/pjpeg")) {
    return;
  }
  throw new BadRequestException(
    "Content-Type does not match image payload (magic bytes mismatch)"
  );
};
