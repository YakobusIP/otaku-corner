import { Injectable, Inject } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import { BaseCrudService } from "@/common/crud/base-crud.service";
import { CrudDelegate } from "@/common/crud/types/crud-delegate.type";
import { CrudQueryBuilder } from "@/common/crud/crud-query-builder.interface";
import { PROGRESS_STATUSES } from "@/common/constants/progress-statuses";
import { chunkArray } from "@/common/utils/chunk-array";
import { AuthorsService } from "@/author/authors.service";
import { GenresService } from "@/genre/genres.service";
import { ThemesService } from "@/theme/themes.service";
import {
  CreateMangaItemDto,
  UpdateMangaDto,
  UpdateMangaReviewDto,
  MangaListResponseDto,
  MangaQueryDto,
  PaginatedMangaResponseDto,
  MangaDetailResponseDto,
} from "@/manga/dto";

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
    @Inject(AuthorsService) private readonly authorsService: AuthorsService,
    @Inject(GenresService) private readonly genresService: GenresService,
    @Inject(ThemesService) private readonly themesService: ThemesService,
  ) {
    super(prisma, queryBuilder);
  }

  protected getDelegate(
    client?: PrismaService | Prisma.TransactionClient,
  ): CrudDelegate {
    return (client ?? this.prisma).manga;
  }

  override async findAll(
    query: MangaQueryDto,
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
              consumedAt: true,
            },
          },
        },
      }),
      this.prisma.manga.count({ where }),
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
        consumedAt: manga.review?.consumedAt ?? null,
      }),
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
            updatedAt: true,
          },
        },
        authors: {
          select: { author: { select: { id: true, name: true } } },
        },
        genres: {
          select: { genre: { select: { id: true, name: true } } },
        },
        themes: {
          select: { theme: { select: { id: true, name: true } } },
        },
      },
    })) as MangaDetailRaw | null;

    if (!manga) {
      throw new (await import("@nestjs/common")).NotFoundException(
        "Manga not found",
      );
    }

    return {
      ...manga,
      images: manga.images as object,
      review: manga.review ?? null,
      authors: manga.authors.map((a) => a.author),
      genres: manga.genres.map((g) => g.genre),
      themes: manga.themes.map((t) => t.theme),
    } as MangaDetailResponseDto;
  }

  async createBulk(data: CreateMangaItemDto[]) {
    const allAuthorNames = [...new Set(data.flatMap((d) => d.authors))];
    const allGenreNames = [...new Set(data.flatMap((d) => d.genres))];
    const allThemeNames = [...new Set(data.flatMap((d) => d.themes))];

    const [authors, genres, themes] = await Promise.all([
      this.authorsService.getOrCreateMany(allAuthorNames),
      this.genresService.getOrCreateMany(allGenreNames),
      this.themesService.getOrCreateMany(allThemeNames),
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
            ...mangaData
          } = item;

          await tx.manga.create({
            data: {
              ...mangaData,
              authors: {
                createMany: {
                  data: authorNames
                    .map((name) => authorMap.get(name))
                    .filter((id): id is number => id !== undefined)
                    .map((authorId) => ({ authorId })),
                },
              },
              genres: {
                createMany: {
                  data: genreNames
                    .map((name) => genreMap.get(name))
                    .filter((id): id is number => id !== undefined)
                    .map((genreId) => ({ genreId })),
                },
              },
              themes: {
                createMany: {
                  data: themeNames
                    .map((name) => themeMap.get(name))
                    .filter((id): id is number => id !== undefined)
                    .map((themeId) => ({ themeId })),
                },
              },
              review: {
                create: {},
              },
            },
          });

          results.push(item.id);
        }
      });
    }

    return results;
  }

  async updateReview(id: number, data: UpdateMangaReviewDto) {
    const updateData: Record<string, unknown> = { ...data };

    const ratings = {
      storylineRating: data.storylineRating,
      artStyleRating: data.artStyleRating,
      charDevelopmentRating: data.charDevelopmentRating,
      worldBuildingRating: data.worldBuildingRating,
      originalityRating: data.originalityRating,
    };

    const weights = {
      storylineRating: 0.3,
      artStyleRating: 0.25,
      charDevelopmentRating: 0.2,
      worldBuildingRating: 0.15,
      originalityRating: 0.1,
    };

    const allRatingsPresent = Object.values(ratings).every(
      (r) => r !== undefined && r !== null,
    );

    if (allRatingsPresent) {
      let personalScore = 0;
      for (const [key, weight] of Object.entries(weights)) {
        personalScore +=
          (ratings[key as keyof typeof ratings] as number) * weight;
      }
      updateData.personalScore = Math.round(personalScore * 100) / 100;
    }

    return this.prisma.mangaReview.update({
      where: { mangaId: id },
      data: updateData,
    });
  }

  async checkDuplicate(id: number): Promise<boolean> {
    const manga = await this.prisma.manga.findUnique({
      where: { id },
      select: { id: true },
    });
    return !!manga;
  }

  async getTotal(): Promise<number> {
    return this.prisma.manga.count();
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
            updatedAt: true,
          },
        },
      },
    })) as SitemapRow[];

    return rawData.map((item) => ({
      id: item.id,
      slug: item.slug,
      createdAt: item.review?.createdAt ?? null,
      updatedAt: item.review?.updatedAt ?? null,
    }));
  }

  async getStatusCounts() {
    const counts = await this.prisma.mangaReview.groupBy({
      by: ["progressStatus"],
      _count: { _all: true },
    });

    return counts.map((item) => ({
      status: item.progressStatus,
      label: PROGRESS_STATUSES[item.progressStatus] ?? item.progressStatus,
      count: item._count._all,
    }));
  }
}
