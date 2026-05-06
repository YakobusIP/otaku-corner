import type { AnimeCreateRequest } from "@/types/anime.type";

import { generateSlug } from "@/lib/utils";

import { type Anime, type AnimeRating } from "@tutkli/jikan-ts";

export const RATING_LABELS: Record<AnimeRating, string> = {
  g: "G - All Ages",
  pg: "PG - Children",
  pg13: "PG-13 - Teens 13 or older",
  r17: "R - 17+ (violence & profanity)",
  r: "R+ - Mild Nudity",
  rx: "Rx - Hentai"
};

export const posterUrl = (anime: Anime) => {
  if (anime.images.webp) return anime.images.webp.image_url;
  return anime.images.jpg.image_url;
};

export const displayYear = (anime: Anime) => {
  if (anime.year) return String(anime.year);
  if (anime.aired?.from) {
    const y = new Date(anime.aired.from).getFullYear();
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

export const formatRatingLabel = (anime: Anime) => {
  if (!anime.rating) return "—";
  return RATING_LABELS[anime.rating] ?? anime.rating;
};

export const ratingForApi = (anime: Anime) => {
  if (!anime.rating) return "Unrated";
  return RATING_LABELS[anime.rating] ?? "Unrated";
};

export const animeToCreateRequest = (
  anime: Anime,
  slugCounts: Record<string, number>
): AnimeCreateRequest => {
  let slug = generateSlug(anime.title);
  if (slugCounts[slug]) {
    slugCounts[slug] += 1;
    slug = `${slug}-${slugCounts[slug]}`;
  } else {
    slugCounts[slug] = 1;
  }

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
