import { Injectable, NotFoundException } from "@nestjs/common";

import { PROGRESS_STATUSES } from "@/common/constants/progress-statuses";
import { BaseCrudService } from "@/common/crud/base-crud.service";
import { CrudQueryBuilder } from "@/common/crud/crud-query-builder.interface";
import { CrudDelegate } from "@/common/crud/types/crud-delegate.type";
import type { RequestLogContextStore } from "@/common/logging/request-log-context";
import { chunkArray } from "@/common/utils";

import { PrismaService } from "@/prisma/prisma.service";

import { AuthorsService } from "@/author/authors.service";
import { GenresService } from "@/genre/genres.service";
import {
  CreateLightNovelItemDto,
  LightNovelDetailResponseDto,
  LightNovelListResponseDto,
  LightNovelQueryDto,
  PaginatedLightNovelResponseDto,
  UpdateLightNovelDto,
  UpdateLightNovelReviewDto,
  UpdateVolumeProgressItemDto
} from "@/light-novel/dto";
import { ThemesService } from "@/theme/themes.service";

import { Prisma, ProgressStatus } from "@prisma/client";

interface LightNovelListRow {
  id: number;
  slug: string;
  title: string;
  titleJapanese: string;
  images: unknown;
  status: string;
  score: number | null;
  volumesCount: number | null;
  review: {
    reviewText: string | null;
    progressStatus: ProgressStatus;
    personalScore: number | null;
  } | null;
  volumeProgress: { volumeNumber: number; consumedAt: Date | null }[];
}

interface SitemapRow {
  id: number;
  slug: string;
  review: { createdAt: Date; updatedAt: Date } | null;
}

export type LightNovelStatusCountItemDto = {
  label: string;
  value: ProgressStatus | null;
  count: number;
};

@Injectable()
export class LightNovelService extends BaseCrudService<
  CrudDelegate,
  CreateLightNovelItemDto,
  UpdateLightNovelDto,
  LightNovelListResponseDto,
  LightNovelDetailResponseDto
> {
  protected readonly resourceName = "Light Novel";

  constructor(
    prisma: PrismaService,
    queryBuilder: CrudQueryBuilder,
    private readonly authorsService: AuthorsService,
    private readonly genresService: GenresService,
    private readonly themesService: ThemesService
  ) {
    super(prisma, queryBuilder);
  }

  protected getDelegate(
    client?: PrismaService | Prisma.TransactionClient
  ): CrudDelegate {
    return (client ?? this.prisma).lightNovel;
  }

  override async findAll(
    query: LightNovelQueryDto
  ): Promise<PaginatedLightNovelResponseDto> {
    const { where, skip, take, orderBy } =
      this.queryBuilder.buildFindAllQuery(query);

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const [rawData, total] = await Promise.all([
      this.prisma.lightNovel.findMany({
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
          volumesCount: true,
          review: {
            select: {
              reviewText: true,
              progressStatus: true,
              personalScore: true
            }
          },
          volumeProgress: {
            select: { volumeNumber: true, consumedAt: true },
            orderBy: { volumeNumber: "asc" }
          }
        }
      }),
      this.prisma.lightNovel.count({ where })
    ]);

    const data: LightNovelListResponseDto[] = (
      rawData as LightNovelListRow[]
    ).map((ln) => ({
      id: ln.id,
      slug: ln.slug,
      title: ln.title,
      titleJapanese: ln.titleJapanese,
      images: ln.images as object,
      status: ln.status,
      score: ln.score,
      volumesCount: ln.volumesCount,
      reviewText: ln.review?.reviewText ?? null,
      progressStatus: ln.review?.progressStatus ?? null,
      personalScore: ln.review?.personalScore ?? null,
      volumeProgress: ln.volumeProgress
    }));

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  override async findOne(id: number): Promise<LightNovelDetailResponseDto> {
    const result = await this.prisma.lightNovel.findUnique({
      where: { id },
      include: {
        review: true,
        volumeProgress: { orderBy: { volumeNumber: "asc" } },
        authors: { include: { author: { select: { id: true, name: true } } } },
        genres: { include: { genre: { select: { id: true, name: true } } } },
        themes: { include: { theme: { select: { id: true, name: true } } } }
      }
    });

    if (!result) {
      throw new NotFoundException("Light Novel not found");
    }

    return {
      ...result,
      images: result.images as object,
      authors: result.authors.map((a) => a.author),
      genres: result.genres.map((g) => g.genre),
      themes: result.themes.map((t) => t.theme)
    } as unknown as LightNovelDetailResponseDto;
  }

  override async update(
    id: number,
    dto: UpdateLightNovelDto
  ): Promise<LightNovelListResponseDto> {
    try {
      await this.prisma.$transaction(async (tx) => {
        const existing = await tx.lightNovel.findUnique({
          where: { id },
          include: { volumeProgress: true }
        });

        if (!existing) {
          throw new NotFoundException("Light Novel not found");
        }

        if (dto.volumesCount !== undefined && dto.volumesCount !== null) {
          const currentCount = existing.volumeProgress.length;
          const newCount = dto.volumesCount;

          if (newCount > currentCount) {
            const newVolumes = Array.from(
              { length: newCount - currentCount },
              (_, i) => ({
                volumeNumber: currentCount + i + 1,
                consumedAt: null as Date | null,
                lightNovelId: id
              })
            );
            await tx.lightNovelVolumes.createMany({ data: newVolumes });
          } else if (newCount < currentCount) {
            await tx.lightNovelVolumes.deleteMany({
              where: {
                lightNovelId: id,
                volumeNumber: { gt: newCount }
              }
            });
          }
        }

        await tx.lightNovel.update({
          where: { id },
          data: dto as Prisma.LightNovelUpdateInput
        });
      });

      return this.mapToListResponse(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw error;
    }
  }

  private async mapToListResponse(
    id: number
  ): Promise<LightNovelListResponseDto> {
    const ln = (await this.prisma.lightNovel.findUnique({
      where: { id },
      select: {
        id: true,
        slug: true,
        title: true,
        titleJapanese: true,
        images: true,
        status: true,
        score: true,
        volumesCount: true,
        review: {
          select: {
            reviewText: true,
            progressStatus: true,
            personalScore: true
          }
        },
        volumeProgress: {
          select: { volumeNumber: true, consumedAt: true },
          orderBy: { volumeNumber: "asc" }
        }
      }
    })) as LightNovelListRow | null;

    if (!ln) {
      throw new NotFoundException("Light Novel not found");
    }

    return {
      id: ln.id,
      slug: ln.slug,
      title: ln.title,
      titleJapanese: ln.titleJapanese,
      images: ln.images as object,
      status: ln.status,
      score: ln.score,
      volumesCount: ln.volumesCount,
      reviewText: ln.review?.reviewText ?? null,
      progressStatus: ln.review?.progressStatus ?? null,
      personalScore: ln.review?.personalScore ?? null,
      volumeProgress: ln.volumeProgress
    };
  }

  async createBulk(
    data: CreateLightNovelItemDto[],
    _requestLog?: RequestLogContextStore
  ): Promise<number[]> {
    void _requestLog;

    const allAuthorNames = [
      ...new Set(data.flatMap((d) => d.authors.map((n) => n.trim())))
    ];
    const allGenreNames = [
      ...new Set(data.flatMap((d) => d.genres.map((n) => n.trim())))
    ];
    const allThemeNames = [
      ...new Set(data.flatMap((d) => d.themes.map((n) => n.trim())))
    ];

    const [authors, genres, themes] = await Promise.all([
      this.authorsService.getOrCreateMany(allAuthorNames),
      this.genresService.getOrCreateMany(allGenreNames),
      this.themesService.getOrCreateMany(allThemeNames)
    ]);

    const authorMap = new Map(authors.map((a) => [a.name, a.id]));
    const genreMap = new Map(genres.map((g) => [g.name, g.id]));
    const themeMap = new Map(themes.map((t) => [t.name, t.id]));

    const chunks = chunkArray(data, 5);
    const results: number[] = [];

    for (const chunk of chunks) {
      await this.prisma.$transaction(async (tx) => {
        for (const item of chunk) {
          const {
            authors: authorNames,
            genres: genreNames,
            themes: themeNames,
            ...lightNovelData
          } = item;

          await tx.lightNovel.create({
            data: {
              ...lightNovelData,
              images: lightNovelData.images as Prisma.InputJsonValue,
              authors: {
                createMany: {
                  data: authorNames
                    .map((name) => authorMap.get(name.trim()))
                    .filter((id): id is number => id !== undefined)
                    .map((authorId) => ({ authorId }))
                }
              },
              genres: {
                createMany: {
                  data: genreNames
                    .map((name) => genreMap.get(name.trim()))
                    .filter((id): id is number => id !== undefined)
                    .map((genreId) => ({ genreId }))
                }
              },
              themes: {
                createMany: {
                  data: themeNames
                    .map((name) => themeMap.get(name.trim()))
                    .filter((id): id is number => id !== undefined)
                    .map((themeId) => ({ themeId }))
                }
              },
              review: { create: {} },
              volumeProgress: {
                create: Array.from(
                  { length: lightNovelData.volumesCount ?? 0 },
                  (_, i) => ({
                    volumeNumber: i + 1,
                    consumedAt: null
                  })
                )
              }
            }
          });

          results.push(item.id);
        }
      });
    }

    return results;
  }

  async updateReview(id: number, data: UpdateLightNovelReviewDto) {
    const lightNovel = await this.prisma.lightNovel.findUnique({
      where: { id },
      include: { review: true }
    });

    if (!lightNovel) {
      throw new NotFoundException("Light Novel not found");
    }

    const ratings = {
      storylineRating:
        data.storylineRating ?? lightNovel.review?.storylineRating,
      worldBuildingRating:
        data.worldBuildingRating ?? lightNovel.review?.worldBuildingRating,
      writingStyleRating:
        data.writingStyleRating ?? lightNovel.review?.writingStyleRating,
      charDevelopmentRating:
        data.charDevelopmentRating ?? lightNovel.review?.charDevelopmentRating,
      originalityRating:
        data.originalityRating ?? lightNovel.review?.originalityRating
    };

    let personalScore: number | null = null;
    const allRatings = Object.values(ratings);
    if (allRatings.every((r) => r != null)) {
      personalScore =
        ratings.storylineRating! * 0.3 +
        ratings.worldBuildingRating! * 0.25 +
        ratings.writingStyleRating! * 0.2 +
        ratings.charDevelopmentRating! * 0.15 +
        ratings.originalityRating! * 0.1;
    }

    const updateData: Record<string, unknown> = { ...data };
    if (personalScore !== null) {
      updateData.personalScore = personalScore;
    }

    return this.prisma.lightNovelReview.upsert({
      where: { lightNovelId: id },
      update: updateData,
      create: {
        lightNovelId: id,
        ...updateData
      }
    });
  }

  async updateVolumeProgress(
    data: UpdateVolumeProgressItemDto[]
  ): Promise<void> {
    await this.prisma.$transaction(
      data.map((item) =>
        this.prisma.lightNovelVolumes.update({
          where: { id: item.id },
          data: { consumedAt: item.consumedAt ?? null }
        })
      )
    );
  }

  async checkDuplicate(id: number): Promise<{ exists: boolean }> {
    const ln = await this.prisma.lightNovel.findUnique({
      where: { id },
      select: { id: true }
    });
    return { exists: !!ln };
  }

  async getTotal(): Promise<{ count: number }> {
    const count = await this.prisma.lightNovel.count();
    return { count };
  }

  async getSitemapData(page: number, limit: number) {
    const rawData = (await this.prisma.lightNovel.findMany({
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

  async getStatusCounts(): Promise<LightNovelStatusCountItemDto[]> {
    const totalCount = await this.prisma.lightNovel.count();

    const counts = await this.prisma.lightNovelReview.groupBy({
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
