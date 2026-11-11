const RATING_LABELS: Record<string, string> = {
  g: "G - All Ages",
  pg: "PG - Children",
  pg13: "PG-13 - Teens 13 or older",
  r17: "R - 17+ (violence & profanity)",
  r: "R+ - Mild Nudity",
  rx: "Rx - Hentai"
};

type TenraiAnimePayload = {
  mal_id?: number;
  type?: string;
  status?: string;
  rating?: string;
  season?: string;
  year?: number;
  title?: string;
  title_japanese?: string;
  title_synonyms?: string[];
  source?: string;
  aired?: { from?: string | null; to?: string | null };
  broadcast?: { string?: string | null };
  episodes?: number | null;
  duration?: string;
  score?: number | null;
  images?: {
    jpg?: {
      image_url?: string;
      large_image_url?: string;
      small_image_url?: string;
    };
    webp?: {
      image_url?: string;
      large_image_url?: string;
      small_image_url?: string;
    };
  };
  synopsis?: string | null;
  trailer?: { embed_url?: string | null };
  url?: string;
  genres?: { name: string }[];
  studios?: { name: string }[];
  themes?: { name: string }[];
};

type TenraiMangaPayload = {
  mal_id?: number;
  status?: string;
  title?: string;
  title_japanese?: string;
  title_synonyms?: string[];
  published?: { from?: string | null; to?: string | null };
  chapters?: number | null;
  volumes?: number | null;
  score?: number | null;
  images?: {
    jpg?: {
      image_url?: string;
      large_image_url?: string;
      small_image_url?: string;
    };
    webp?: {
      image_url?: string;
      large_image_url?: string;
      small_image_url?: string;
    };
  };
  synopsis?: string | null;
  url?: string;
  authors?: { name: string }[];
  genres?: { name: string }[];
  themes?: { name: string }[];
};

const ratingForApi = (rating?: string): string => {
  if (!rating) {
    return "Unrated";
  }
  return RATING_LABELS[rating] ?? "Unrated";
};

const formatAired = (payload: TenraiAnimePayload): string => {
  const fromDate = payload.aired?.from ? new Date(payload.aired.from) : null;
  const fromFormatted =
    fromDate && Number.isFinite(fromDate.getTime())
      ? fromDate.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric"
        })
      : "?";

  if (payload.type === "TV") {
    if (payload.status === "Not yet aired") {
      return payload.status;
    }
    const to = payload.aired?.to ? new Date(payload.aired.to) : null;
    const toStr =
      to && Number.isFinite(to.getTime())
        ? to.toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric"
          })
        : "?";
    return `${fromFormatted} to ${toStr}`;
  }

  return fromFormatted;
};

const formatPublished = (payload: TenraiMangaPayload): string => {
  const fromDate = payload.published?.from
    ? new Date(payload.published.from)
    : null;
  if (!fromDate || !Number.isFinite(fromDate.getTime())) {
    return "—";
  }
  const fromStr = fromDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
  if (!payload.published?.to) {
    return `${fromStr} to ?`;
  }
  const to = new Date(payload.published.to);
  const toStr = Number.isFinite(to.getTime())
    ? to.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric"
      })
    : "?";
  return `${fromStr} to ${toStr}`;
};

const mapImages = (
  images: TenraiAnimePayload["images"] | TenraiMangaPayload["images"]
): Record<string, string> | null => {
  if (!images) {
    return null;
  }
  const webp = images.webp;
  const jpg = images.jpg;
  const imageUrl = webp?.image_url ?? jpg?.image_url;
  if (!imageUrl) {
    return null;
  }
  return {
    image_url: imageUrl,
    large_image_url: webp?.large_image_url ?? jpg?.large_image_url ?? imageUrl,
    small_image_url: webp?.small_image_url ?? jpg?.small_image_url ?? imageUrl
  };
};

export const mapTenraiAnimeToCatalog = (
  payload: unknown
): Record<string, unknown> | null => {
  if (!payload || typeof payload !== "object") {
    return null;
  }
  const anime = payload as TenraiAnimePayload;
  const images = mapImages(anime.images);
  if (!images) {
    return null;
  }

  return {
    type: String(anime.type ?? ""),
    status: String(anime.status ?? ""),
    rating: ratingForApi(anime.rating),
    season: anime.season
      ? `${anime.season.toUpperCase()} ${anime.year ?? ""}`.trim()
      : null,
    title: String(anime.title ?? ""),
    titleJapanese: String(anime.title_japanese ?? ""),
    titleSynonyms: (anime.title_synonyms ?? [])
      .map((synonym) => synonym.toLowerCase())
      .join(" "),
    source: String(anime.source ?? ""),
    aired: formatAired(anime),
    broadcast: anime.broadcast?.string ?? "N/A",
    episodesCount:
      typeof anime.episodes === "number" && !Number.isNaN(anime.episodes)
        ? Math.floor(anime.episodes)
        : null,
    duration: String(anime.duration ?? ""),
    score: typeof anime.score === "number" ? anime.score : null,
    images,
    synopsis: anime.synopsis ? anime.synopsis : "No synopsis available",
    trailer: anime.trailer?.embed_url
      ? anime.trailer.embed_url.replace(/(autoplay=)[^&]+/, "autoplay=0")
      : null,
    malUrl: String(anime.url ?? "")
  };
};

export const mapTenraiMangaToCatalog = (
  payload: unknown
): Record<string, unknown> | null => {
  if (!payload || typeof payload !== "object") {
    return null;
  }
  const manga = payload as TenraiMangaPayload;
  const images = mapImages(manga.images);
  if (!images) {
    return null;
  }

  return {
    status: String(manga.status ?? ""),
    title: String(manga.title ?? ""),
    titleJapanese: String(manga.title_japanese ?? ""),
    titleSynonyms: (manga.title_synonyms ?? [])
      .map((synonym) => synonym.toLowerCase())
      .join(" "),
    published: formatPublished(manga),
    chaptersCount:
      typeof manga.chapters === "number" && !Number.isNaN(manga.chapters)
        ? Math.floor(manga.chapters)
        : null,
    volumesCount:
      typeof manga.volumes === "number" && !Number.isNaN(manga.volumes)
        ? Math.floor(manga.volumes)
        : null,
    score: typeof manga.score === "number" ? manga.score : null,
    images,
    synopsis: manga.synopsis ? manga.synopsis : "No synopsis available",
    malUrl: String(manga.url ?? "")
  };
};

export const mapTenraiLightNovelToCatalog = (
  payload: unknown
): Record<string, unknown> | null => {
  const mapped = mapTenraiMangaToCatalog(payload);
  if (!mapped) {
    return null;
  }
  const { chaptersCount: _chapters, volumesCount, ...rest } = mapped;
  return {
    ...rest,
    volumesCount: volumesCount ?? null
  };
};
