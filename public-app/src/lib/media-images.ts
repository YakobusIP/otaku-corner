type MalImages = {
  large_image_url?: string | null;
  image_url?: string | null;
};

export const pickMediaImageSrc = (
  images: unknown,
  fallback = "/placeholder.svg"
): string => {
  if (!images || typeof images !== "object") {
    return fallback;
  }
  const row = images as MalImages;
  return row.large_image_url || row.image_url || fallback;
};
