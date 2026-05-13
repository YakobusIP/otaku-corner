import { Injectable, NotFoundException } from "@nestjs/common";

import { PROGRESS_STATUSES } from "@/common/constants/progress-statuses";
import { BaseCrudService } from "@/common/crud/base-crud.service";
import { CrudQueryBuilder } from "@/common/crud/crud-query-builder.interface";
import { CrudDelegate } from "@/common/crud/types/crud-delegate.type";
import type { RequestLogContextStore } from "@/common/logging/request-log-context";
import {
  MANGA_REVIEW_PERSONAL_SCORE_WEIGHTS,
  computeRoundedWeightedPersonalScore
} from "@/common/review-personal-score";
import {
  buildRelationIdLookupMap,
  requireRelationIdFromMap
} from "@/common/utils";
import { chunkArray } from "@/common/utils/chunk-array";

import { PrismaService } from "@/prisma/prisma.service";

import { AuthorsService } from "@/author/authors.service";
import { GenresService } from "@/genre/genres.service";
import {
  CreateMangaItemDto,
  MangaDetailResponseDto,
  MangaListResponseDto,
  MangaQueryDto,
  PaginatedMangaResponseDto,
  UpdateMangaDto,
  UpdateMangaReviewDto
} from "@/manga/dto";
import { FetchMangaDataQueueService } from "@/manga/fetch-manga-data.queue";
import { ThemesService } from "@/theme/themes.service";

import { Prisma, ProgressStatus } from "@prisma/client";

interface MangaWithReview {
  id: number;
  slug: string;
  title: string;
  titleJapanese: string;
  images: unknown;
  status: string;
  score: number | null;
  chaptersCount: number | null;
  volumesCount: number | null;
  review: {
    reviewText: string | null;
    progressStatus: string;
    personalScore: number | null;
    consumedAt: Date | null;
  } | null;
}

interface MangaDetailRaw {
  id: number;
  slug: string;
  status: string;
  title: string;
  titleJapanese: string;
  titleSynonyms: string;
  published: string;
  chaptersCount: number | null;
  volumesCount: number | null;
  score: number | null;
  images: unknown;
  synopsis: string;
  malUrl: string;
  createdAt: Date;
  updatedAt: Date;
  review: {
    id: number;
    reviewText: string | null;
    storylineRating: number | null;
    artStyleRating: number | null;
    charDevelopmentRating: number | null;
    worldBuildingRating: number | null;
    originalityRating: number | null;
    personalScore: number | null;
    progressStatus: string;
    consumedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  authors: { author: { id: number; name: string } }[];
  genres: { genre: { id: number; name: string } }[];
  themes: { theme: { id: number; name: string } }[];
}

interface SitemapRow {
  id: number;
  slug: string;
  review: { createdAt: Date; updatedAt: Date } | null;
}

export type MangaStatusCountItemDto = {
  label: string;
  value: ProgressStatus | null;
  count: number;
};

@Injectable()
export class MangaService extends BaseCrudService<
  CrudDelegate,
  CreateMangaItemDto,
  UpdateMangaDto,
  MangaListResponseDto,
  MangaDetailResponseDto
> {
  protected readonly resourceName = "Manga";

  constructor(
    prisma: PrismaService,
    queryBuilder: CrudQueryBuilder,
    private readonly authorsService: AuthorsService,
    private readonly genresService: GenresService,
    private readonly themesService: ThemesService,
    private readonly fetchMangaDataQueue: FetchMangaDataQueueService
  ) {
    super(prisma, queryBuilder);
  }

  protected getDelegate(
    client?: PrismaService | Prisma.TransactionClient
  ): CrudDelegate {
    return (client ?? this.prisma).manga;
  }

  override async findAll(
    query: MangaQueryDto
  ): Promise<PaginatedMangaResponseDto> {
    const { where, skip, take, orderBy } =
      this.queryBuilder.buildFindAllQuery(query);

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const [rawData, total] = await Promise.all([
      this.prisma.manga.findMany({
        where,
        skip,
        take,
        orderBy,
        select: {
          id: true,
          slug: true,
          title: true,
          titleJapanese: true,
          images: true,
          status: true,
          score: true,
          chaptersCount: true,
          volumesCount: true,
          review: {
            select: {
              reviewText: true,
              progressStatus: true,
              personalScore: true,
              consumedAt: true
            }
          }
        }
      }),
      this.prisma.manga.count({ where })
    ]);

    const data: MangaListResponseDto[] = (rawData as MangaWithReview[]).map(
      (manga) => ({
        id: manga.id,
        slug: manga.slug,
        title: manga.title,
        titleJapanese: manga.titleJapanese,
        images: manga.images as object,
        status: manga.status,
        score: manga.score,
        chaptersCount: manga.chaptersCount,
        volumesCount: manga.volumesCount,
        reviewText: manga.review?.reviewText ?? null,
        progressStatus:
          (manga.review
            ?.progressStatus as MangaListResponseDto["progressStatus"]) ?? null,
        personalScore: manga.review?.personalScore ?? null,
        consumedAt: manga.review?.consumedAt ?? null
      })
    );

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  override async findOne(id: number): Promise<MangaDetailResponseDto> {
    const manga = (await this.prisma.manga.findUnique({
      where: { id },
      include: {
        review: {
          select: {
            id: true,
            reviewText: true,
            storylineRating: true,
            artStyleRating: true,
            charDevelopmentRating: true,
            worldBuildingRating: true,
            originalityRating: true,
            personalScore: true,
            progressStatus: true,
            consumedAt: true,
            createdAt: true,
            updatedAt: true
          }
        },
        authors: {
          select: { author: { select: { id: true, name: true } } }
        },
        genres: {
          select: { genre: { select: { id: true, name: true } } }
        },
        themes: {
          select: { theme: { select: { id: true, name: true } } }
        }
      }
    })) as MangaDetailRaw | null;

    if (!manga) {
      throw new NotFoundException("Manga not found");
    }

    return {
      ...manga,
      images: manga.images as object,
      review: manga.review ?? null,
      authors: manga.authors.map((a) => a.author),
      genres: manga.genres.map((g) => g.genre),
      themes: manga.themes.map((t) => t.theme)
    } as MangaDetailResponseDto;
  }

  async createBulk(
    data: CreateMangaItemDto[],
    requestLog?: RequestLogContextStore
  ) {
    const allAuthorNames = [...new Set(data.flatMap((d) => d.authors))];
    const allGenreNames = [...new Set(data.flatMap((d) => d.genres))];
    const allThemeNames = [...new Set(data.flatMap((d) => d.themes))];

    const [authors, genres, themes] = await Promise.all([
      this.authorsService.getOrCreateMany(allAuthorNames),
      this.genresService.getOrCreateMany(allGenreNames),
      this.themesService.getOrCreateMany(allThemeNames)
    ]);

    const authorMap = buildRelationIdLookupMap(authors);
    const genreMap = buildRelationIdLookupMap(genres);
    const themeMap = buildRelationIdLookupMap(themes);

    const chunks = chunkArray(data, 5);
    const results: number[] = [];

    for (const chunk of chunks) {
      const enqueueAfterChunk: {
        id: number;
        title: string;
        titleJapanese: string;
        status: string;
      }[] = [];

      await this.prisma.$transaction(async (tx) => {
        for (const item of chunk) {
          const {
            authors: authorNames,
            genres: genreNames,
            themes: themeNames,
            ...mangaData
          } = item;

          await tx.manga.create({
            data: {
              ...mangaData,
              authors: {
                createMany: {
                  data: authorNames.map((name) => ({
                    authorId: requireRelationIdFromMap(
                      authorMap,
                      name,
                      "Author"
                    )
                  }))
                }
              },
              genres: {
                createMany: {
                  data: genreNames.map((name) => ({
                    genreId: requireRelationIdFromMap(genreMap, name, "Genre")
                  }))
                }
              },
              themes: {
                createMany: {
                  data: themeNames.map((name) => ({
                    themeId: requireRelationIdFromMap(themeMap, name, "Theme")
                  }))
                }
              },
              review: {
                create: {}
              }
            }
          });

          enqueueAfterChunk.push({
            id: item.id,
            title: item.title,
            titleJapanese: item.titleJapanese,
            status: item.status
          });
          results.push(item.id);
        }
      });

      for (const job of enqueueAfterChunk) {
        this.fetchMangaDataQueue.enqueueAfterCreate(
          job.id,
          job.title,
          job.titleJapanese,
          job.status,
          requestLog
        );
      }
    }

    return results;
  }

  async updateReview(id: number, data: UpdateMangaReviewDto) {
    const manga = await this.prisma.manga.findUnique({
      where: { id },
      include: { review: true }
    });

    if (!manga) {
      throw new NotFoundException("Manga not found");
    }

    const review = manga.review;

    const ratings = {
      storylineRating: data.storylineRating ?? review?.storylineRating,
      artStyleRating: data.artStyleRating ?? review?.artStyleRating,
      charDevelopmentRating:
        data.charDevelopmentRating ?? review?.charDevelopmentRating,
      worldBuildingRating:
        data.worldBuildingRating ?? review?.worldBuildingRating,
      originalityRating: data.originalityRating ?? review?.originalityRating
    };

    const updateData: Record<string, unknown> = { ...data };

    const personalScore = computeRoundedWeightedPersonalScore(
      ratings,
      MANGA_REVIEW_PERSONAL_SCORE_WEIGHTS
    );
    if (personalScore !== null) {
      updateData.personalScore = personalScore;
    }

    return this.prisma.mangaReview.update({
      where: { mangaId: id },
      data: updateData
    });
  }

  async checkDuplicate(id: number): Promise<{ exists: boolean }> {
    const manga = await this.prisma.manga.findUnique({
      where: { id },
      select: { id: true }
    });
    return { exists: !!manga };
  }

  async getTotal(): Promise<{ count: number }> {
    const count = await this.prisma.manga.count();
    return { count };
  }

  async getSitemapData(page: number, limit: number) {
    const rawData = (await this.prisma.manga.findMany({
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        slug: true,
        review: {
          select: {
            createdAt: true,
            updatedAt: true
          }
        }
      }
    })) as SitemapRow[];

    return rawData.map((item) => ({
      id: item.id,
      slug: item.slug,
      createdAt: item.review?.createdAt ?? null,
      updatedAt: item.review?.updatedAt ?? null
    }));
  }

  async getStatusCounts(): Promise<MangaStatusCountItemDto[]> {
    const totalCount = await this.prisma.manga.count();

    const counts = await this.prisma.mangaReview.groupBy({
      by: ["progressStatus"],
      _count: { _all: true }
    });

    const countsMap = Object.fromEntries(
      counts.map((c) => [c.progressStatus, c._count._all])
    );

    const mappedStatus = (
      Object.keys(PROGRESS_STATUSES) as ProgressStatus[]
    ).map((status) => ({
      label: PROGRESS_STATUSES[status] ?? status,
      value: status,
      count: countsMap[status] ?? 0
    }));

    return [{ label: "All", value: null, count: totalCount }, ...mappedStatus];
  }
}
