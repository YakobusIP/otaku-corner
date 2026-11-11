export const ANIME_CATALOG_FIELDS = [
  "type",
  "status",
  "rating",
  "season",
  "title",
  "titleJapanese",
  "titleSynonyms",
  "source",
  "aired",
  "broadcast",
  "episodesCount",
  "duration",
  "score",
  "images",
  "synopsis",
  "trailer",
  "malUrl"
] as const;

export const MANGA_CATALOG_FIELDS = [
  "status",
  "title",
  "titleJapanese",
  "titleSynonyms",
  "published",
  "chaptersCount",
  "volumesCount",
  "score",
  "images",
  "synopsis",
  "malUrl"
] as const;

export const LIGHT_NOVEL_CATALOG_FIELDS = [
  "status",
  "title",
  "titleJapanese",
  "titleSynonyms",
  "published",
  "volumesCount",
  "score",
  "images",
  "synopsis",
  "malUrl"
] as const;

export type CatalogField =
  | (typeof ANIME_CATALOG_FIELDS)[number]
  | (typeof MANGA_CATALOG_FIELDS)[number]
  | (typeof LIGHT_NOVEL_CATALOG_FIELDS)[number];

export const catalogFieldsForMediaType = (
  mediaType: "ANIME" | "MANGA" | "LIGHT_NOVEL"
): readonly string[] => {
  switch (mediaType) {
    case "ANIME":
      return ANIME_CATALOG_FIELDS;
    case "MANGA":
      return MANGA_CATALOG_FIELDS;
    case "LIGHT_NOVEL":
      return LIGHT_NOVEL_CATALOG_FIELDS;
  }
};

export const pickCatalogFields = (
  record: Record<string, unknown>,
  fields: readonly string[]
): Record<string, unknown> => {
  const picked: Record<string, unknown> = {};
  for (const field of fields) {
    if (field in record) {
      picked[field] = record[field] ?? null;
    }
  }
  return picked;
};

/** Returns undefined when the field has no stored baseline (distinct from explicit null). */
export const getFieldBaseline = (
  baseline: Record<string, unknown> | null,
  field: string
): unknown => {
  if (!baseline) {
    return undefined;
  }
  if (!Object.prototype.hasOwnProperty.call(baseline, field)) {
    return undefined;
  }
  return baseline[field];
};

export const pickBaselineFieldUpdates = (
  updates: Record<string, unknown>,
  fields: readonly string[]
): Record<string, unknown> => {
  const picked: Record<string, unknown> = {};
  for (const field of fields) {
    if (Object.prototype.hasOwnProperty.call(updates, field)) {
      picked[field] = updates[field];
    }
  }
  return picked;
};
