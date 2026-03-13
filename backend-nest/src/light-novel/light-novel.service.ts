import { Injectable, NotFoundException } from "@nestjs/common";

import { PROGRESS_STATUSES } from "@/common/constants/progress-statuses";
import { BaseCrudService } from "@/common/crud/base-crud.service";
import { CrudQueryBuilder } from "@/common/crud/crud-query-builder.interface";
import { CrudDelegate } from "@/common/crud/types/crud-delegate.type";
import { PaginatedResponseDto, PaginationQueryDto } from "@/common/dto";
import { chunkArray } from "@/common/utils/chunk-array";

import { PrismaService } from "@/prisma/prisma.service";

import { AuthorsService } from "@/author/authors.service";
import { GenresService } from "@/genre/genres.service";
import {
  CreateLightNovelItemDto,
  LightNovelDetailResponseDto,
  LightNovelListResponseDto,
  LightNovelQueryDto,
  UpdateLightNovelDto,
  UpdateLightNovelReviewDto,
  UpdateVolumeProgressItemDto
} from "@/light-novel/dto";
import { ThemesService } from "@/theme/themes.service";

import { Prisma, ProgressStatus } from "@prisma/client";

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

  async findAll(
    query: LightNovelQueryDto
  ): Promise<PaginatedResponseDto<LightNovelListResponseDto>> {
    const { where, skip, take, orderBy, include } =
      this.queryBuilder.buildFindAllQuery(query);

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const findManyArgs: Record<string, unknown> = {
      where,
      skip,
      take,
      select: {
        id: true,
        slug: true,
        title: true,
        titleJapanese: true,
        images: true,
        status: true,
        score: true,
        volumesCount: true,
        ...(include as Record<string, unknown>)
      }
    };
    if (orderBy) findManyArgs.orderBy = orderBy;

    const [data, total] = await Promise.all([
      this.prisma.lightNovel.findMany(
        findManyArgs as Prisma.LightNovelFindManyArgs
      ),
      this.prisma.lightNovel.count({
        where: where as Prisma.LightNovelWhereInput
      })
    ]);

    const mapped = data.map((ln) => {
      const record = ln as Record<string, unknown>;
      const review = record.review as Record<string, unknown> | null;
      return {
        id: ln.id,
        slug: ln.slug,
        title: ln.title,
        titleJapanese: ln.titleJapanese,
        images: ln.images,
        status: ln.status,
        score: ln.score,
        volumesCount: ln.volumesCount,
        reviewText: (review?.reviewText as string | null) ?? null,
        progressStatus: (review?.progressStatus as ProgressStatus) ?? null,
        personalScore: (review?.personalScore as number | null) ?? null,
        volumeProgress:
          (record.volumeProgress as {
            volumeNumber: number;
            consumedAt: Date | null;
          }[]) ?? []
      } as LightNovelListResponseDto;
    });

    return {
      data: mapped,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findOne(id: number): Promise<LightNovelDetailResponseDto> {
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

    return result as unknown as LightNovelDetailResponseDto;
  }

  async createBulk(
    items: CreateLightNovelItemDto[]
  ): Promise<{ count: number }> {
    const chunks = chunkArray(items, 10);
    let totalCreated = 0;

    for (const chunk of chunks) {
      await this.prisma.$transaction(async (tx) => {
        for (const item of chunk) {
          const { authors, genres, themes, ...lightNovelData } = item;

          const [authorRecords, genreRecords, themeRecords] = await Promise.all(
            [
              this.authorsService.getOrCreateMany(authors),
              this.genresService.getOrCreateMany(genres),
              this.themesService.getOrCreateMany(themes)
            ]
          );

          await tx.lightNovel.create({
            data: {
              ...lightNovelData,
              images: lightNovelData.images as Prisma.InputJsonValue,
              authors: {
                create: authorRecords.map((a) => ({ authorId: a.id }))
              },
              genres: {
                create: genreRecords.map((g) => ({ genreId: g.id }))
              },
              themes: {
                create: themeRecords.map((t) => ({ themeId: t.id }))
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

          totalCreated++;
        }
      });
    }

    return { count: totalCreated };
  }

  async updateLightNovel(
    id: number,
    dto: UpdateLightNovelDto
  ): Promise<LightNovelDetailResponseDto> {
    const existing = await this.prisma.lightNovel.findUnique({
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
        await this.prisma.lightNovelVolumes.createMany({ data: newVolumes });
      } else if (newCount < currentCount) {
        await this.prisma.lightNovelVolumes.deleteMany({
          where: {
            lightNovelId: id,
            volumeNumber: { gt: newCount }
          }
        });
      }
    }

    const result = await this.prisma.lightNovel.update({
      where: { id },
      data: dto as Prisma.LightNovelUpdateInput,
      include: {
        review: true,
        volumeProgress: { orderBy: { volumeNumber: "asc" } },
        authors: { include: { author: { select: { id: true, name: true } } } },
        genres: { include: { genre: { select: { id: true, name: true } } } },
        themes: { include: { theme: { select: { id: true, name: true } } } }
      }
    });

    return result as unknown as LightNovelDetailResponseDto;
  }

  async updateReview(
    id: number,
    dto: UpdateLightNovelReviewDto
  ): Promise<LightNovelDetailResponseDto> {
    const lightNovel = await this.prisma.lightNovel.findUnique({
      where: { id },
      include: { review: true }
    });

    if (!lightNovel) {
      throw new NotFoundException("Light Novel not found");
    }

    const ratings = {
      storylineRating:
        dto.storylineRating ?? lightNovel.review?.storylineRating,
      worldBuildingRating:
        dto.worldBuildingRating ?? lightNovel.review?.worldBuildingRating,
      writingStyleRating:
        dto.writingStyleRating ?? lightNovel.review?.writingStyleRating,
      charDevelopmentRating:
        dto.charDevelopmentRating ?? lightNovel.review?.charDevelopmentRating,
      originalityRating:
        dto.originalityRating ?? lightNovel.review?.originalityRating
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

    const updateData: Record<string, unknown> = { ...dto };
    if (personalScore !== null) {
      updateData.personalScore = personalScore;
    }

    await this.prisma.lightNovelReview.upsert({
      where: { lightNovelId: id },
      update: updateData,
      create: {
        lightNovelId: id,
        ...updateData
      }
    });

    return this.findOne(id);
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
    const count = await this.prisma.lightNovel.count({ where: { id } });
    return { exists: count > 0 };
  }

  async getTotal(): Promise<{ total: number }> {
    const total = await this.prisma.lightNovel.count();
    return { total };
  }

  async getSitemapData(
    query: PaginationQueryDto
  ): Promise<
    PaginatedResponseDto<{ id: number; slug: string; updatedAt: Date }>
  > {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const [data, total] = await Promise.all([
      this.prisma.lightNovel.findMany({
        select: { id: true, slug: true, updatedAt: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: "asc" }
      }),
      this.prisma.lightNovel.count()
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getStatusCounts(): Promise<Record<string, number>> {
    const statuses = Object.keys(PROGRESS_STATUSES);
    const counts: Record<string, number> = {};

    await Promise.all(
      statuses.map(async (status) => {
        counts[status] = await this.prisma.lightNovelReview.count({
          where: { progressStatus: status as ProgressStatus }
        });
      })
    );

    return counts;
  }
}
