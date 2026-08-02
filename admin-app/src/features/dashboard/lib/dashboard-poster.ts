export const dashboardPosterSrc = (images: unknown): string | null => {
  if (!images || typeof images !== "object") {
    return null;
  }
  const record = images as Record<string, unknown>;
  const primary =
    record.large_image_url ?? record.image_url ?? record.small_image_url;
  return typeof primary === "string" && primary.length > 0 ? primary : null;
};
