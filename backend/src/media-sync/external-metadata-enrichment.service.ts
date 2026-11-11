import { Injectable } from "@nestjs/common";

import { loggedAxiosRequest } from "@/common/logging/http-client-logging";
import type { HttpClientLogContext } from "@/common/logging/http-client-logging";
import { StructuredLogger } from "@/common/logging/structured-logger.service";

import { stringSimilarity } from "string-similarity-js";

const ANILIST_GRAPHQL_URL = "https://graphql.anilist.co";
const RANOBEDB_API_BASE = "https://ranobedb.org/api/v0";
const SIMILARITY_THRESHOLD = 0.9;

const MANGA_SEARCH_QUERY = `
query ($search: String) {
  Page(perPage: 50) {
    media(search: $search, type: MANGA) {
      id
      idMal
      format
      volumes
      chapters
      title { romaji english native }
      synonyms
    }
  }
}
`;

type AnilistMedia = {
  idMal: number | null;
  format: string;
  volumes: number | null;
  chapters: number | null;
  title: {
    romaji: string | null;
    english: string | null;
    native: string | null;
  };
  synonyms: string[] | null;
};

type RanobeDbSeriesListRow = {
  c_num_books: number;
  volumes?: { count: string | number | bigint } | null;
  title: string;
  title_orig: string | null;
  romaji: string | null;
  romaji_orig: string | null;
};

@Injectable()
export class ExternalMetadataEnrichmentService {
  constructor(private readonly logger: StructuredLogger) {}

  async fetchMangaCounts(
    malId: number,
    title: string,
    titleJapanese: string,
    httpContext: HttpClientLogContext
  ): Promise<{
    chaptersCount: number | null;
    volumesCount: number | null;
  } | null> {
    const search = titleJapanese.length > 0 ? titleJapanese : title;
    const response = await loggedAxiosRequest<{
      data?: { Page?: { media?: AnilistMedia[] | null } };
      errors?: { message: string }[];
    }>(this.logger, httpContext, {
      method: "POST",
      url: ANILIST_GRAPHQL_URL,
      data: { query: MANGA_SEARCH_QUERY, variables: { search } },
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      }
    });

    const items = response.data.data?.Page?.media ?? [];
    const chosen = this.pickAnilistMedia(items, malId, title, titleJapanese);
    if (!chosen) {
      return null;
    }

    return {
      chaptersCount: this.floorCount(chosen.chapters),
      volumesCount: this.floorCount(chosen.volumes)
    };
  }

  async fetchLightNovelVolumeCount(
    title: string,
    titleJapanese: string,
    httpContext: HttpClientLogContext
  ): Promise<number | null> {
    const search = titleJapanese.length > 0 ? titleJapanese : title;
    const response = await loggedAxiosRequest<{
      series?: RanobeDbSeriesListRow[];
    }>(this.logger, httpContext, {
      method: "GET",
      url: `${RANOBEDB_API_BASE}/series`,
      params: { q: search, page: 1, limit: 100 },
      headers: { Accept: "application/json" }
    });

    const items = response.data.series ?? [];
    const chosen = this.pickRanobeDbSeries(items, title, titleJapanese);
    if (!chosen) {
      return null;
    }

    const fromBooks =
      typeof chosen.c_num_books === "number" ? chosen.c_num_books : 0;
    const rawVolumeCount = chosen.volumes?.count;
    const fromVolumes =
      rawVolumeCount === undefined || rawVolumeCount === null
        ? 0
        : typeof rawVolumeCount === "bigint"
          ? Number(rawVolumeCount)
          : Number(rawVolumeCount);

    const resolved = Math.max(fromBooks, fromVolumes);
    return Number.isFinite(resolved) && resolved > 0 ? resolved : null;
  }

  private pickAnilistMedia(
    items: AnilistMedia[],
    malMangaId: number,
    title: string,
    titleJapanese: string
  ): AnilistMedia | null {
    if (items.length === 0) {
      return null;
    }

    const byMal = items.find((media) => media.idMal === malMangaId);
    if (byMal) {
      return byMal;
    }

    const compareTitle = titleJapanese.length > 0 ? titleJapanese : title;
    const similar = items.filter((media) => {
      const candidates = [
        media.title.native,
        media.title.english,
        media.title.romaji,
        ...(media.synonyms ?? [])
      ].filter((value): value is string => Boolean(value));
      return candidates.some(
        (candidate) =>
          stringSimilarity(compareTitle, candidate) > SIMILARITY_THRESHOLD
      );
    });

    if (similar.length === 0) {
      return null;
    }

    return (
      similar.find((media) => media.format === "MANGA") ??
      similar.find((media) => media.format !== "ONE_SHOT") ??
      similar[0] ??
      null
    );
  }

  private pickRanobeDbSeries(
    items: RanobeDbSeriesListRow[],
    title: string,
    titleJapanese: string
  ): RanobeDbSeriesListRow | null {
    if (items.length === 0) {
      return null;
    }

    const compareTitle = titleJapanese.length > 0 ? titleJapanese : title;
    for (const series of items) {
      const candidates = [
        series.title_orig,
        series.title,
        series.romaji_orig,
        series.romaji
      ].filter((value): value is string => Boolean(value));
      if (candidates.some((candidate) => candidate === compareTitle)) {
        return series;
      }
    }

    for (const series of items) {
      const candidates = [
        series.title_orig,
        series.title,
        series.romaji_orig,
        series.romaji
      ].filter((value): value is string => Boolean(value));
      if (
        candidates.some(
          (candidate) =>
            stringSimilarity(compareTitle, candidate) > SIMILARITY_THRESHOLD
        )
      ) {
        return series;
      }
    }

    return null;
  }

  private floorCount(value: number | null): number | null {
    if (typeof value !== "number" || Number.isNaN(value)) {
      return null;
    }
    const floored = Math.floor(value);
    return floored >= 0 ? floored : null;
  }
}
