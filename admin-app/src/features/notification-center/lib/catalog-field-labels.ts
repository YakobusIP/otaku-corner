const CATALOG_FIELD_LABELS: Record<string, string> = {
  type: "Type",
  status: "Status",
  rating: "Rating",
  season: "Season",
  title: "Title",
  titleJapanese: "Japanese title",
  titleSynonyms: "Title synonyms",
  source: "Source",
  aired: "Aired",
  broadcast: "Broadcast",
  episodesCount: "Episodes",
  duration: "Duration",
  score: "Score",
  images: "Images",
  synopsis: "Synopsis",
  trailer: "Trailer",
  malUrl: "MAL URL",
  published: "Published",
  chaptersCount: "Chapters",
  volumesCount: "Volumes"
};

export const getCatalogFieldLabel = (field: string): string =>
  CATALOG_FIELD_LABELS[field] ?? field;

export const formatConflictValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "empty";
  }
  if (typeof value === "string") {
    return value.length > 120 ? `${value.slice(0, 119)}…` : value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  try {
    const serialized = JSON.stringify(value);
    return serialized.length > 120
      ? `${serialized.slice(0, 119)}…`
      : serialized;
  } catch {
    return String(value);
  }
};
