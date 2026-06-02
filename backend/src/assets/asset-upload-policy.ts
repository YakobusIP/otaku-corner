const NORMALIZED_IMAGE_MIME_BY_RAW = new Map<string, string>([
  ["image/jpeg", "image/jpeg"],
  ["image/jpg", "image/jpeg"],
  ["image/pjpeg", "image/jpeg"],
  ["image/png", "image/png"],
  ["image/gif", "image/gif"],
  ["image/webp", "image/webp"]
]);

const EXTENSION_BY_NORMALIZED_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp"
};

export const ALLOWED_IMAGE_ASSET_MIMES = new Set(
  NORMALIZED_IMAGE_MIME_BY_RAW.values()
);

export const normalizeDeclaredImageMimeType = (
  raw: string | undefined
): string | null => {
  if (typeof raw !== "string") {
    return null;
  }
  const key = raw.trim().toLowerCase().split(";")[0]?.trim() ?? "";
  return NORMALIZED_IMAGE_MIME_BY_RAW.get(key) ?? null;
};

export const fileExtensionForNormalizedImageMime = (
  normalizedMime: string
): string | null => EXTENSION_BY_NORMALIZED_MIME[normalizedMime] ?? null;

export const normalizeContentTypeHeader = (
  raw: string | undefined
): string | null => {
  if (typeof raw !== "string" || raw.trim() === "") {
    return null;
  }
  return raw.trim().toLowerCase().split(";")[0]?.trim() ?? null;
};

export const assetDeclaredImageMimeMatchesHead = (
  headContentType: string | undefined,
  declaredMime: string
): boolean => {
  const fromHead = normalizeContentTypeHeader(headContentType);
  if (!fromHead) {
    return true;
  }
  const declaredNorm = normalizeDeclaredImageMimeType(declaredMime);
  if (!declaredNorm) {
    return false;
  }
  if (fromHead === declaredNorm) {
    return true;
  }
  return (
    declaredNorm === "image/jpeg" &&
    (fromHead === "image/jpg" || fromHead === "image/pjpeg")
  );
};
