import { Injectable, Inject } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import { BaseCrudService } from "@/common/crud/base-crud.service";
import { CrudDelegate } from "@/common/crud/types/crud-delegate.type";
import { CrudQueryBuilder } from "@/common/crud/crud-query-builder.interface";
import { PROGRESS_STATUSES } from "@/common/constants/progress-statuses";
import { chunkArray } from "@/common/utils/chunk-array";
import { GenresService } from "@/genre/genres.service";
import { StudiosService } from "@/studio/studios.service";
import { ThemesService } from "@/theme/themes.service";
import {
  CreateAnimeItemDto,
  UpdateAnimeDto,
  UpdateAnimeReviewDto,
  AnimeListResponseDto,
  AnimeQueryDto,
  PaginatedAnimeResponseDto,
  AnimeDetailResponseDto,
} from "@/anime/dto";

interface AnimeWithReviewAndCount {
  id: number;
  slug: string;
  title: string;
  titleJapanese: string;
  images: unknown;
  status: string;
  type: string;
  score: number | null;
  season: string | null;
  aired: string;
  rating: string;
  review: {
    reviewText: string | null;
    progressStatus: string;
    personalScore: number | null;
    consumedAt: Date | null;
  } | null;
  _count: { episodes: number };
}

interface AnimeDetailRaw {
  id: number;
  slug: string;
  type: string;
  status: string;
  rating: string;
  season: string | null;
  title: string;
  titleJapanese: string;
  titleSynonyms: string;
  source: string;
  aired: string;
  broadcast: string;
  episodesCount: number | null;
  duration: string;
  score: number | null;
  images: unknown;
  synopsis: string;
  trailer: string | null;
  malUrl: string;
  createdAt: Date;
  updatedAt: Date;
  review: {
    id: number;
    reviewText: string | null;
    storylineRating: number | null;
    qualityRating: number | null;
    voiceActingRating: number | null;
    soundTrackRating: number | null;
    charDevelopmentRating: number | null;
    personalScore: number | null;
    progressStatus: string;
    consumedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  genres: { genre: { id: number; name: string } }[];
  studios: { studio: { id: number; name: string } }[];
  themes: { theme: { id: number; name: string } }[];
  episodes: {
    id: number;
    aired: string;
    number: number;
    title: string;
    titleJapanese: string | null;
    titleRomaji: string | null;
  }[];
}

interface SitemapRow {
  id: number;
  slug: string;
  review: { createdAt: Date; updatedAt: Date } | null;
}

@Injectable()
export class AnimeService extends BaseCrudService<
  CrudDelegate,
  CreateAnimeItemDto,
  UpdateAnimeDto,
  AnimeListResponseDto,
  AnimeDetailResponseDto
> {
  protected readonly resourceName = "Anime";

  constructor(
    prisma: PrismaService,
    queryBuilder: CrudQueryBuilder,
    @Inject(GenresService) private readonly genresService: GenresService,
    @Inject(StudiosService) private readonly studiosService: StudiosService,
    @Inject(ThemesService) private readonly themesService: ThemesService,
  ) {
    super(prisma, queryBuilder);
  }

  protected getDelegate(
    client?: PrismaService | Prisma.TransactionClient,
  ): CrudDelegate {
    return (client ?? this.prisma).anime;
  }

  override async findAll(
    query: AnimeQueryDto,
  ): Promise<PaginatedAnimeResponseDto> {
    const { where, skip, take, orderBy } =
      this.queryBuilder.buildFindAllQuery(query);

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const [rawData, total] = await Promise.all([
      this.prisma.anime.findMany({
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
          type: true,
          score: true,
          season: true,
          aired: true,
          rating: true,
          review: {
            select: {
              reviewText: true,
              progressStatus: true,
              personalScore: true,
              consumedAt: true,
            },
          },
          _count: { select: { episodes: true } },
        },
      }),
      this.prisma.anime.count({ where }),
    ]);

    const data: AnimeListResponseDto[] = (
      rawData as AnimeWithReviewAndCount[]
    ).map((anime) => ({
      id: anime.id,
      slug: anime.slug,
      title: anime.title,
      titleJapanese: anime.titleJapanese,
      images: anime.images as object,
      status: anime.status,
      type: anime.type,
      score: anime.score,
      season: anime.season,
      aired: anime.aired,
      rating: anime.rating,
      reviewText: anime.review?.reviewText ?? null,
      progressStatus:
        (anime.review
          ?.progressStatus as AnimeListResponseDto["progressStatus"]) ?? null,
      personalScore: anime.review?.personalScore ?? null,
      consumedAt: anime.review?.consumedAt ?? null,
      fetchedEpisode: anime._count.episodes,
    }));

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  override async findOne(id: number): Promise<AnimeDetailResponseDto> {
    const anime = (await this.prisma.anime.findUnique({
      where: { id },
      include: {
        review: {
          select: {
            id: true,
            reviewText: true,
            storylineRating: true,
            qualityRating: true,
            voiceActingRating: true,
            soundTrackRating: true,
            charDevelopmentRating: true,
            personalScore: true,
            progressStatus: true,
            consumedAt: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        genres: {
          select: { genre: { select: { id: true, name: true } } },
        },
        studios: {
          select: { studio: { select: { id: true, name: true } } },
        },
        themes: {
          select: { theme: { select: { id: true, name: true } } },
        },
        episodes: {
          select: {
            id: true,
            aired: true,
            number: true,
            title: true,
            titleJapanese: true,
            titleRomaji: true,
          },
          orderBy: { number: "asc" },
        },
      },
    })) as AnimeDetailRaw | null;

    if (!anime) {
      const { NotFoundException } = await import("@nestjs/common");
      throw new NotFoundException("Anime not found");
    }

    return {
      ...anime,
      images: anime.images as object,
      review: anime.review ?? null,
      genres: anime.genres.map((g) => g.genre),
      studios: anime.studios.map((s) => s.studio),
      themes: anime.themes.map((t) => t.theme),
      episodes: anime.episodes,
    } as AnimeDetailResponseDto;
  }

  async createBulk(data: CreateAnimeItemDto[]) {
    const allGenreNames = [...new Set(data.flatMap((d) => d.genres))];
    const allStudioNames = [...new Set(data.flatMap((d) => d.studios))];
    const allThemeNames = [...new Set(data.flatMap((d) => d.themes))];

    const [genres, studios, themes] = await Promise.all([
      this.genresService.getOrCreateMany(allGenreNames),
      this.studiosService.getOrCreateMany(allStudioNames),
      this.themesService.getOrCreateMany(allThemeNames),
    ]);

    const genreMap = new Map(genres.map((g) => [g.name, g.id]));
    const studioMap = new Map(studios.map((s) => [s.name, s.id]));
    const themeMap = new Map(themes.map((t) => [t.name, t.id]));

    const chunks = chunkArray(data, 5);
    const results: number[] = [];

    for (const chunk of chunks) {
      await this.prisma.$transaction(async (tx) => {
        for (const item of chunk) {
          const {
            episodes,
            genres: genreNames,
            studios: studioNames,
            themes: themeNames,
            ...animeData
          } = item;

          await tx.anime.create({
            data: {
              ...animeData,
              genres: {
                createMany: {
                  data: genreNames
                    .map((name) => genreMap.get(name))
                    .filter((id): id is number => id !== undefined)
                    .map((genreId) => ({ genreId })),
                },
              },
              studios: {
                createMany: {
                  data: studioNames
                    .map((name) => studioMap.get(name))
                    .filter((id): id is number => id !== undefined)
                    .map((studioId) => ({ studioId })),
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
              episodes: {
                createMany: {
                  data: episodes.map((ep) => ({
                    aired: ep.aired,
                    number: ep.number,
                    title: ep.title,
                    titleJapanese: ep.titleJapanese,
                    titleRomaji: ep.titleRomaji,
                  })),
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

  async updateReview(id: number, data: UpdateAnimeReviewDto) {
    const updateData: Record<string, unknown> = { ...data };

    const ratings = {
      storylineRating: data.storylineRating,
      qualityRating: data.qualityRating,
      voiceActingRating: data.voiceActingRating,
      soundTrackRating: data.soundTrackRating,
      charDevelopmentRating: data.charDevelopmentRating,
    };

    const weights = {
      storylineRating: 0.3,
      qualityRating: 0.25,
      voiceActingRating: 0.2,
      soundTrackRating: 0.15,
      charDevelopmentRating: 0.1,
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

    return this.prisma.animeReview.update({
      where: { animeId: id },
      data: updateData,
    });
  }

  async checkDuplicate(id: number): Promise<boolean> {
    const anime = await this.prisma.anime.findUnique({
      where: { id },
      select: { id: true },
    });
    return !!anime;
  }

  async getTotal(): Promise<number> {
    return this.prisma.anime.count();
  }

  async getSitemapData(page: number, limit: number) {
    const rawData = (await this.prisma.anime.findMany({
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
    const counts = await this.prisma.animeReview.groupBy({
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
