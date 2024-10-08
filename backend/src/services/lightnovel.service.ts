import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { AuthorService } from "./author.service";
import { GenreService } from "./genre.service";
import { ThemeService } from "./theme.service";

type CustomLightNovelCreateInput = Omit<
  Prisma.LightNovelCreateInput,
  "authors" | "genres" | "themes"
> & {
  authors: string[];
  genres: string[];
  themes: string[];
};

type CustomLightNovelReviewUpdateInput = Pick<
  Prisma.LightNovelUpdateInput,
  | "review"
  | "storylineRating"
  | "worldBuildingRating"
  | "writingStyleRating"
  | "charDevelopmentRating"
  | "originalityRating"
  | "personalScore"
>;

export class LightNovelService {
  private static readonly scoringWeight = {
    storylineRating: 0.3,
    worldBuildingRating: 0.25,
    writingStyleRating: 0.2,
    charDevelopmentRating: 0.15,
    originalityRating: 0.1
  };

  constructor(
    private readonly authorService: AuthorService,
    private readonly genreService: GenreService,
    private readonly themeService: ThemeService
  ) {}

  private validatePersonalScore(data: CustomLightNovelCreateInput) {
    const {
      storylineRating,
      worldBuildingRating,
      writingStyleRating,
      charDevelopmentRating,
      originalityRating,
      personalScore
    } = data;

    if (
      storylineRating &&
      worldBuildingRating &&
      writingStyleRating &&
      charDevelopmentRating &&
      originalityRating &&
      personalScore
    ) {
      const calculatedScore =
        storylineRating * LightNovelService.scoringWeight.storylineRating +
        worldBuildingRating *
          LightNovelService.scoringWeight.worldBuildingRating +
        writingStyleRating *
          LightNovelService.scoringWeight.writingStyleRating +
        charDevelopmentRating *
          LightNovelService.scoringWeight.charDevelopmentRating +
        originalityRating * LightNovelService.scoringWeight.originalityRating;

      return calculatedScore;
    }

    return null;
  }

  async getAllLightNovels(
    currentPage: number,
    limitPerPage: number,
    query?: string,
    sortBy?: string,
    sortOrder?: Prisma.SortOrder,
    filterAuthor?: string,
    filterGenre?: string,
    filterTheme?: string,
    filterMALScore?: string,
    filterPersonalScore?: string
  ) {
    const lowerCaseQuery = query && query.toLowerCase();
    const scoreRanges: Record<string, { min: number; max: number }> = {
      poor: { min: 1, max: 3.99 },
      average: { min: 4, max: 6.99 },
      good: { min: 7, max: 8.99 },
      excellent: { min: 9, max: 10 }
    };

    const filterCriteria: Prisma.LightNovelWhereInput = {
      AND: [
        {
          OR: [
            {
              title: {
                contains: lowerCaseQuery,
                mode: "insensitive"
              }
            },
            {
              titleSynonyms: {
                contains: lowerCaseQuery,
                mode: "insensitive"
              }
            }
          ]
        },
        ...(filterAuthor ? [{ authors: { some: { id: filterAuthor } } }] : []),
        ...(filterGenre ? [{ genres: { some: { id: filterGenre } } }] : []),
        ...(filterTheme ? [{ themes: { some: { id: filterTheme } } }] : []),
        ...(filterMALScore
          ? [
              {
                score: {
                  gte: scoreRanges[filterMALScore].min,
                  lte: scoreRanges[filterMALScore].max
                }
              }
            ]
          : []),
        ...(filterPersonalScore
          ? [
              {
                personalScore: {
                  gte: scoreRanges[filterPersonalScore].min,
                  lte: scoreRanges[filterPersonalScore].max
                }
              }
            ]
          : [])
      ]
    };

    const itemCount = await prisma.lightNovel.count({
      where: filterCriteria
    });

    const pageCount = Math.ceil(itemCount / limitPerPage);

    const data = await prisma.lightNovel.findMany({
      where: filterCriteria,
      select: {
        id: true,
        title: true,
        titleJapanese: true,
        images: true,
        status: true,
        score: true,
        progressStatus: true,
        personalScore: true
      },
      orderBy: {
        title: sortBy === "title" ? sortOrder : undefined,
        score: sortBy === "score" ? sortOrder : undefined
      },
      take: limitPerPage,
      skip: (currentPage - 1) * limitPerPage
    });

    return {
      data,
      metadata: {
        currentPage,
        limitPerPage,
        pageCount,
        itemCount
      }
    };
  }

  async getLightNovelById(id: string) {
    return prisma.lightNovel.findUnique({
      where: { id },
      include: {
        authors: { select: { id: true, name: true } },
        genres: { select: { id: true, name: true } },
        themes: { select: { id: true, name: true } }
      }
    });
  }

  async createLightNovel(data: CustomLightNovelCreateInput) {
    const authorIds = await Promise.all(
      data.authors.map(async (name) => {
        const id = await this.authorService.getOrCreateAuthor(name);
        return { id } as Prisma.AuthorWhereUniqueInput;
      })
    );
    const genreIds = await Promise.all(
      data.genres.map(async (name) => {
        const id = await this.genreService.getOrCreateGenre(name);
        return { id } as Prisma.GenreWhereUniqueInput;
      })
    );
    const themeIds = await Promise.all(
      data.themes.map(async (name) => {
        const id = await this.themeService.getOrCreateTheme(name);
        return { id } as Prisma.ThemeWhereUniqueInput;
      })
    );

    const lightNovelData: Prisma.LightNovelCreateInput = {
      ...data,
      authors: { connect: authorIds },
      genres: { connect: genreIds },
      themes: { connect: themeIds }
    };

    const calculatedPersonalScore = this.validatePersonalScore(data);

    if (
      !calculatedPersonalScore ||
      Math.abs(calculatedPersonalScore - (data.personalScore as number)) > 0.001
    ) {
      console.warn(
        "Arriving LIGHT_NOVEL personal score calculation is incorrect"
      );
      lightNovelData.personalScore = calculatedPersonalScore;
    }

    return prisma.lightNovel.create({ data: lightNovelData });
  }

  async updateLightNovel(id: string, data: Prisma.LightNovelUpdateInput) {
    return prisma.lightNovel.update({ where: { id }, data });
  }

  async updateLightNovelReview(
    id: string,
    data: CustomLightNovelReviewUpdateInput
  ) {
    return prisma.lightNovel.update({ where: { id }, data });
  }

  async updateLightNovelProgressStatus(
    id: string,
    data: Pick<Prisma.LightNovelUpdateInput, "progressStatus">
  ) {
    return prisma.lightNovel.update({
      where: { id },
      data
    });
  }

  async deleteLightNovel(id: string) {
    return prisma.lightNovel.delete({ where: { id } });
  }

  async deleteMultipleLightNovels(ids: string[]) {
    return prisma.lightNovel.deleteMany({ where: { id: { in: ids } } });
  }
}
