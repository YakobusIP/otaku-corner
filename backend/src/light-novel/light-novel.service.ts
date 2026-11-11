import { Injectable, NotFoundException } from "@nestjs/common";

import { AuditLogService } from "@/common/audit/audit-log.service";
import { PROGRESS_STATUSES } from "@/common/constants/progress-statuses";
import { BaseCrudService } from "@/common/crud/base-crud.service";
import { CrudQueryBuilder } from "@/common/crud/crud-query-builder.interface";
import { CrudDelegate } from "@/common/crud/types/crud-delegate.type";
import type { RequestLogContextStore } from "@/common/logging/request-log-context";
import {
  auditAdminMediaUpdate,
  auditMediaCreate,
  softDeleteMedia
} from "@/common/media/media-lifecycle.helper";
import { notDeletedMediaWhere } from "@/common/media/not-deleted-media-where";
import { computeRoundedWeightedPersonalScore } from "@/common/review-personal-score";
import {
  buildRelationIdLookupMap,
  requireRelationIdFromMap
} from "@/common/utils";
import { chunkArray } from "@/common/utils/chunk-array";

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
import { FetchLightNovelRanobeDbQueueService } from "@/light-novel/fetch-light-novel-ranobedb.queue";
import { MediaCatalogSyncService } from "@/media-sync/media-catalog-sync.service";
import { MediaSyncOrchestratorService } from "@/media-sync/media-sync-orchestrator.service";
import { SettingsService } from "@/settings/settings.service";
import { ThemesService } from "@/theme/themes.service";

import { MediaSyncMediaType, Prisma, ProgressStatus } from "@prisma/client";

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
    private readonly themesService: ThemesService,
    private readonly fetchLightNovelRanobeDbQueue: FetchLightNovelRanobeDbQueueService,
    private readonly settingsService: SettingsService,
    private readonly auditLogService: AuditLogService,
    private readonly mediaSyncOrchestrator: MediaSyncOrchestratorService,
    private readonly catalogSyncService: MediaCatalogSyncService
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
    const result = await this.prisma.lightNovel.findFirst({
      where: { id, ...notDeletedMediaWhere },
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

    const { authors, genres, themes, volumeProgress, ...rest } = result;

    return {
      ...rest,
      images: result.images as object,
      volumeProgress: volumeProgress.map((row) => ({
        id: row.id,
        volumeNumber: row.volumeNumber,
        consumedAt: row.consumedAt
      })),
      authors: authors.map((a) => a.author),
      genres: genres.map((g) => g.genre),
      themes: themes.map((t) => t.theme)
    } as unknown as LightNovelDetailResponseDto;
  }

  override async update(
    id: number,
    dto: UpdateLightNovelDto
  ): Promise<LightNovelListResponseDto> {
    const before = await this.prisma.lightNovel.findFirst({
      where: { id, ...notDeletedMediaWhere }
    });
    if (!before) {
      throw new NotFoundException("Light Novel not found");
    }

    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.lightNovel.findFirst({
        where: { id, ...notDeletedMediaWhere },
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

    const updated = await this.mapToListResponse(id);
    await auditAdminMediaUpdate({
      auditLogService: this.auditLogService,
      entityType: "lightNovel",
      id,
      before: before as unknown as Record<string, unknown>,
      after: updated as unknown as Record<string, unknown>
    });

    await this.catalogSyncService.refreshOpenConflictSnapshotsAfterLocalEdit({
      mediaType: MediaSyncMediaType.LIGHT_NOVEL,
      mediaId: id
    });

    return updated;
  }

  override async delete(id: number): Promise<void> {
    await softDeleteMedia(
      this.prisma,
      "lightNovel",
      [id],
      this.auditLogService
    );
  }

  override async deleteMany(ids: number[]): Promise<void> {
    await softDeleteMedia(this.prisma, "lightNovel", ids, this.auditLogService);
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
    requestLog?: RequestLogContextStore
  ): Promise<number[]> {
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
      }[] = [];

      await this.prisma.$transaction(async (tx) => {
        for (const item of chunk) {
          const {
            authors: authorNames,
            genres: genreNames,
            themes: themeNames,
            ...lightNovelData
          } = item;

          const created = await tx.lightNovel.create({
            data: {
              ...lightNovelData,
              images: lightNovelData.images as Prisma.InputJsonValue,
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

          await auditMediaCreate({
            auditLogService: this.auditLogService,
            entityType: "lightNovel",
            id: created.id,
            after: created as unknown as Record<string, unknown>,
            tx
          });

          enqueueAfterChunk.push({
            id: item.id,
            title: item.title,
            titleJapanese: item.titleJapanese
          });
          results.push(item.id);
        }
      });

      for (const job of enqueueAfterChunk) {
        this.fetchLightNovelRanobeDbQueue.enqueueAfterCreate(
          job.id,
          job.title,
          job.titleJapanese,
          requestLog
        );
      }
    }

    return results;
  }

  async enqueueExternalMetadataSync(
    id: number,
    _requestLog?: RequestLogContextStore
  ): Promise<void> {
    const row = await this.prisma.lightNovel.findFirst({
      where: { id, ...notDeletedMediaWhere },
      select: { id: true }
    });

    if (!row) {
      throw new NotFoundException("Light Novel not found");
    }

    await this.mediaSyncOrchestrator.startSingleMediaRun(
      MediaSyncMediaType.LIGHT_NOVEL,
      id
    );
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

    const weights =
      await this.settingsService.getReviewPersonalScoreWeights("lightNovel");
    const personalScore = computeRoundedWeightedPersonalScore(ratings, weights);

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
    const ln = await this.prisma.lightNovel.findFirst({
      where: { id, ...notDeletedMediaWhere },
      select: { id: true }
    });
    return { exists: !!ln };
  }

  async getTotal(): Promise<{ count: number }> {
    const count = await this.prisma.lightNovel.count({
      where: notDeletedMediaWhere
    });
    return { count };
  }

  async getSitemapData(page: number, limit: number) {
    const rawData = (await this.prisma.lightNovel.findMany({
      where: notDeletedMediaWhere,
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
    const totalCount = await this.prisma.lightNovel.count({
      where: notDeletedMediaWhere
    });

    const counts = await this.prisma.lightNovelReview.groupBy({
      by: ["progressStatus"],
      where: { lightNovel: notDeletedMediaWhere },
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
