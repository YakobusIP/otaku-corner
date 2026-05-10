import type { AnimeCreateRequest } from "@/types/anime.type";
import type { LightNovelCreateRequest } from "@/types/light-novel.type";
import type { MangaCreateRequest } from "@/types/manga.type";

import { generateSlug } from "@/lib/utils";

import { type Anime, type AnimeRating, type Manga } from "@tutkli/jikan-ts";

const RATING_LABELS: Record<AnimeRating, string> = {
  g: "G - All Ages",
  pg: "PG - Children",
  pg13: "PG-13 - Teens 13 or older",
  r17: "R - 17+ (violence & profanity)",
  r: "R+ - Mild Nudity",
  rx: "Rx - Hentai"
};

export const posterUrl = (entry: Anime | Manga) => {
  if (entry.images.webp) return entry.images.webp.image_url;
  return entry.images.jpg.image_url;
};

export const displayYearAnime = (anime: Anime) => {
  if (anime.year) return String(anime.year);
  if (anime.aired?.from) {
    const y = new Date(anime.aired.from).getFullYear();
    return Number.isFinite(y) ? String(y) : "—";
  }
  return "—";
};

/** Jikan {@link Manga} search results (manga + light novel dialogs). */
export const displayYearFromPublished = (m: Manga) => {
  if (m.published?.from) {
    const y = new Date(m.published.from).getFullYear();
    return Number.isFinite(y) ? String(y) : "—";
  }
  return "—";
};

export const formatAired = (anime: Anime) => {
  if (!anime.aired?.from) return "—";
  const from = new Date(anime.aired.from);
  if (!Number.isFinite(from.getTime())) return "—";
  const fromStr = from.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
  if (!anime.aired.to) return `${fromStr} to ?`;
  const to = new Date(anime.aired.to);
  const toStr = Number.isFinite(to.getTime())
    ? to.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric"
      })
    : "?";
  return `${fromStr} to ${toStr}`;
};

export const formatPublished = (m: Manga) => {
  if (!m.published?.from) return "—";
  const from = new Date(m.published.from);
  if (!Number.isFinite(from.getTime())) return "—";
  const fromStr = from.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
  if (!m.published.to) return `${fromStr} to ?`;
  const to = new Date(m.published.to);
  const toStr = Number.isFinite(to.getTime())
    ? to.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric"
      })
    : "?";
  return `${fromStr} to ${toStr}`;
};

export const formatRatingLabel = (anime: Anime) => {
  if (!anime.rating) return "—";
  return RATING_LABELS[anime.rating] ?? anime.rating;
};

const ratingForApi = (anime: Anime) => {
  if (!anime.rating) return "Unrated";
  return RATING_LABELS[anime.rating] ?? "Unrated";
};

const allocateSlug = (title: string, slugCounts: Record<string, number>) => {
  let slug = generateSlug(title);
  if (slugCounts[slug]) {
    slugCounts[slug] += 1;
    slug = `${slug}-${slugCounts[slug]}`;
  } else {
    slugCounts[slug] = 1;
  }
  return slug;
};

export const animeToCreateRequest = (
  anime: Anime,
  slugCounts: Record<string, number>
): AnimeCreateRequest => {
  const slug = allocateSlug(anime.title, slugCounts);

  const fromDate = anime.aired?.from ? new Date(anime.aired.from) : null;
  const fromFormatted =
    fromDate && Number.isFinite(fromDate.getTime())
      ? fromDate.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric"
        })
      : "?";

  const airedStr =
    anime.type === "TV"
      ? anime.status === "Not yet aired"
        ? anime.status
        : `${fromFormatted} to ${
            anime.aired?.to
              ? new Date(anime.aired.to).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "short",
                  year: "numeric"
                })
              : "?"
          }`
      : fromFormatted;

  return {
    id: anime.mal_id,
    slug,
    type: String(anime.type ?? ""),
    status: String(anime.status ?? ""),
    rating: ratingForApi(anime),
    season: anime.season ? `${anime.season.toUpperCase()} ${anime.year}` : null,
    title: anime.title,
    titleJapanese: anime.title_japanese,
    titleSynonyms: anime.title_synonyms
      .map((synonym) => synonym.toLowerCase())
      .join(" "),
    source: anime.source ?? "",
    aired: airedStr,
    broadcast: anime.broadcast.string ?? "N/A",
    episodesCount: anime.episodes ?? null,
    duration: anime.duration ?? "",
    score: anime.score ?? 0,
    images: {
      image_url: anime.images.webp
        ? anime.images.webp.image_url
        : anime.images.jpg.image_url,
      large_image_url: anime.images.webp
        ? anime.images.webp.large_image_url
        : anime.images.jpg.large_image_url,
      small_image_url: anime.images.webp
        ? anime.images.webp.small_image_url
        : anime.images.jpg.small_image_url
    },
    genres: anime.genres.map((genre) => genre.name),
    studios: anime.studios.map((studio) => studio.name),
    themes: anime.themes.map((theme) => theme.name),
    synopsis: anime.synopsis ? anime.synopsis : "No synopsis available",
    trailer: anime.trailer?.embed_url?.replace(
      /(autoplay=)[^&]+/,
      "autoplay=0"
    ),
    malUrl: anime.url
  };
};

export const mangaToCreateRequest = (
  manga: Manga,
  slugCounts: Record<string, number>
): MangaCreateRequest => {
  const slug = allocateSlug(manga.title, slugCounts);

  const publishedStr =
    manga.status === "Upcoming"
      ? manga.status
      : manga.published?.from
        ? `${new Date(manga.published.from).toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric"
          })} to ${
            manga.published.to
              ? new Date(manga.published.to).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "short",
                  year: "numeric"
                })
              : "?"
          }`
        : String(manga.status ?? "?");

  return {
    id: manga.mal_id,
    slug,
    status: String(manga.status ?? ""),
    title: manga.title,
    titleJapanese: manga.title_japanese,
    titleSynonyms: (manga.title_synonyms ?? [])
      .map((synonym) => synonym.toLowerCase())
      .join(" "),
    published: publishedStr,
    chaptersCount: manga.chapters ?? null,
    volumesCount: manga.volumes ?? null,
    score: manga.score ?? 0,
    images: {
      image_url: manga.images.webp
        ? manga.images.webp.image_url
        : manga.images.jpg.image_url,
      large_image_url: manga.images.webp
        ? manga.images.webp.large_image_url
        : manga.images.jpg.large_image_url,
      small_image_url: manga.images.webp
        ? manga.images.webp.small_image_url
        : manga.images.jpg.small_image_url
    },
    authors: manga.authors.map((author) => author.name),
    genres: manga.genres.map((genre) => genre.name),
    themes: manga.themes.map((theme) => theme.name),
    synopsis: manga.synopsis ? manga.synopsis : "No synopsis available",
    malUrl: manga.url
  };
};

export const lightNovelToCreateRequest = (
  ln: Manga,
  slugCounts: Record<string, number>
): LightNovelCreateRequest => {
  const slug = allocateSlug(ln.title, slugCounts);

  const publishedStr =
    ln.status === "Upcoming"
      ? ln.status
      : ln.published?.from
        ? `${new Date(ln.published.from).toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric"
          })} to ${
            ln.published.to
              ? new Date(ln.published.to).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "short",
                  year: "numeric"
                })
              : "?"
          }`
        : String(ln.status ?? "?");

  return {
    id: ln.mal_id,
    slug,
    status: String(ln.status ?? ""),
    title: ln.title,
    titleJapanese: ln.title_japanese,
    titleSynonyms: (ln.title_synonyms ?? [])
      .map((synonym) => synonym.toLowerCase())
      .join(" "),
    published: publishedStr,
    volumesCount: ln.volumes ?? null,
    score: ln.score ?? 0,
    images: {
      image_url: ln.images.webp
        ? ln.images.webp.image_url
        : ln.images.jpg.image_url,
      large_image_url: ln.images.webp
        ? ln.images.webp.large_image_url
        : ln.images.jpg.large_image_url,
      small_image_url: ln.images.webp
        ? ln.images.webp.small_image_url
        : ln.images.jpg.small_image_url
    },
    authors: ln.authors.map((author) => author.name),
    genres: ln.genres.map((genre) => genre.name),
    themes: ln.themes.map((theme) => theme.name),
    synopsis: ln.synopsis ? ln.synopsis : "No synopsis available",
    malUrl: ln.url
  };
};
