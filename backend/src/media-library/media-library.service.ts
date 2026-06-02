import { Injectable } from "@nestjs/common";

import { SCORE_RANGES } from "@/common/constants/progress-statuses";

import { PrismaService } from "@/prisma/prisma.service";

import { AnimeListResponseDto } from "@/anime/dto";
import { LightNovelListResponseDto } from "@/light-novel/dto";
import { MangaListResponseDto } from "@/manga/dto";
import {
  MediaLibraryQueryDto,
  PaginatedMediaLibraryResponseDto
} from "@/media-library/dto";

import { ProgressStatus } from "@prisma/client";
import { listMediaLibraryItems } from "@prisma/client/sql";

type MediaLibrarySqlRow = {
  mediaType: "anime" | "manga" | "lightNovel";
  id: number;
  slug: string;
  title: string;
  titleJapanese: string;
  images: unknown;
  status: string;
  type: string | null;
  score: number | null;
  season: string | null;
  aired: string | null;
  rating: string | null;
  chaptersCount: number | null;
  volumesCount: number | null;
  reviewText: string | null;
  progressStatus: string | null;
  personalScore: number | null;
  consumedAt: Date | null;
  fetchedEpisode: number | null;
  volumeProgress: unknown;
  totalCount: number;
};

type VolumeProgressItem = {
  volumeNumber: number;
  consumedAt: Date | null;
};

@Injectable()
export class MediaLibraryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: MediaLibraryQueryDto
  ): Promise<PaginatedMediaLibraryResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const offset = (page - 1) * limit;
    const sort = this.normalizeSort(query.sort);
    const order: "asc" | "desc" = query.order === "desc" ? "desc" : "asc";

    const malScoreRange = this.getScoreRange(query.malScore);
    const personalScoreRange = this.getScoreRange(query.personalScore);
    const statusCheck = this.normalizeStatusCheck(query.statusCheck);

    const searchQuery = this.normalizeSearchQuery(query.query);

    let rows = await this.queryItems({
      status: query.status ?? null,
      malScoreMin: malScoreRange?.min ?? null,
      malScoreMax: malScoreRange?.max ?? null,
      personalScoreMin: personalScoreRange?.min ?? null,
      personalScoreMax: personalScoreRange?.max ?? null,
      statusCheck,
      genreId: query.genre ?? null,
      studioId: query.studio ?? null,
      themeId: query.theme ?? null,
      authorId: query.author ?? null,
      animeType: query.type ?? null,
      searchQuery,
      sort,
      order,
      limit,
      offset
    });
    let total = rows[0]?.totalCount ?? 0;

    if (rows.length === 0 && page > 1) {
      const firstRow = await this.queryItems({
        status: query.status ?? null,
        malScoreMin: malScoreRange?.min ?? null,
        malScoreMax: malScoreRange?.max ?? null,
        personalScoreMin: personalScoreRange?.min ?? null,
        personalScoreMax: personalScoreRange?.max ?? null,
        statusCheck,
        genreId: query.genre ?? null,
        studioId: query.studio ?? null,
        themeId: query.theme ?? null,
        authorId: query.author ?? null,
        animeType: query.type ?? null,
        searchQuery,
        sort,
        order,
        limit: 1,
        offset: 0
      });
      total = firstRow[0]?.totalCount ?? 0;
      rows = [];
    }

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    const data = rows.map((row) => {
      if (row.mediaType === "anime") {
        const item: AnimeListResponseDto = {
          id: row.id,
          slug: row.slug,
          title: row.title,
          titleJapanese: row.titleJapanese,
          images: row.images as object,
          status: row.status,
          type: row.type ?? "",
          score: row.score,
          season: row.season,
          aired: row.aired ?? "",
          rating: row.rating ?? "",
          reviewText: row.reviewText,
          progressStatus:
            (row.progressStatus as AnimeListResponseDto["progressStatus"]) ??
            null,
          personalScore: row.personalScore,
          consumedAt: row.consumedAt,
          fetchedEpisode: row.fetchedEpisode ?? 0
        };
        return { ...item, mediaType: "anime" as const };
      }

      if (row.mediaType === "manga") {
        const item: MangaListResponseDto = {
          id: row.id,
          slug: row.slug,
          title: row.title,
          titleJapanese: row.titleJapanese,
          images: row.images as object,
          status: row.status,
          score: row.score,
          chaptersCount: row.chaptersCount,
          volumesCount: row.volumesCount,
          reviewText: row.reviewText,
          progressStatus:
            (row.progressStatus as MangaListResponseDto["progressStatus"]) ??
            null,
          personalScore: row.personalScore,
          consumedAt: row.consumedAt
        };
        return { ...item, mediaType: "manga" as const };
      }

      const item: LightNovelListResponseDto = {
        id: row.id,
        slug: row.slug,
        title: row.title,
        titleJapanese: row.titleJapanese,
        images: row.images as object,
        status: row.status,
        score: row.score,
        volumesCount: row.volumesCount,
        reviewText: row.reviewText,
        progressStatus:
          (row.progressStatus as LightNovelListResponseDto["progressStatus"]) ??
          null,
        personalScore: row.personalScore,
        volumeProgress: row.volumeProgress as VolumeProgressItem[]
      };
      return { ...item, mediaType: "lightNovel" as const };
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages
    };
  }

  private async queryItems(params: {
    status: ProgressStatus | null;
    malScoreMin: number | null;
    malScoreMax: number | null;
    personalScoreMin: number | null;
    personalScoreMax: number | null;
    statusCheck: "complete" | "incomplete" | null;
    genreId: number | null;
    studioId: number | null;
    themeId: number | null;
    authorId: number | null;
    animeType: string | null;
    searchQuery: string | null;
    sort: string;
    order: "asc" | "desc";
    limit: number;
    offset: number;
  }): Promise<MediaLibrarySqlRow[]> {
    return this.prisma.$queryRawTyped(
      listMediaLibraryItems(
        params.status,
        params.malScoreMin,
        params.malScoreMax,
        params.personalScoreMin,
        params.personalScoreMax,
        params.statusCheck,
        params.sort,
        params.order,
        params.limit,
        params.offset,
        params.genreId,
        params.studioId,
        params.themeId,
        params.authorId,
        params.animeType,
        params.searchQuery
      )
    ) as Promise<MediaLibrarySqlRow[]>;
  }

  private getScoreRange(key?: string) {
    return key ? SCORE_RANGES[key] : undefined;
  }

  private normalizeSearchQuery(query?: string): string | null {
    const t = query?.trim();
    return t && t.length > 0 ? t : null;
  }

  private normalizeSort(sort?: string) {
    if (sort === "score") return "score";
    if (sort === "personal_score") return "personal_score";
    return "title";
  }

  private normalizeStatusCheck(statusCheck?: string) {
    if (statusCheck === "complete" || statusCheck === "incomplete") {
      return statusCheck;
    }
    return null;
  }
}
