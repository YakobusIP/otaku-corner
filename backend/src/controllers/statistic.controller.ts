import { Request, Response, NextFunction } from "express";
import { BadRequestError, UnprocessableEntityError } from "../lib/error";
import { StatisticService } from "../services/statistic.service";
import { STATISTICS_VIEW } from "../enum/general.enum";
import { z } from "zod";

const statisticsViewSchema = z.enum([
  STATISTICS_VIEW.MONTHLY,
  STATISTICS_VIEW.YEARLY
]);

const querySchema = z.object({
  view: statisticsViewSchema,
  year: z.string().optional()
});

const allowedMedias = ["anime", "manga", "lightNovel"] as const;
type Media = (typeof allowedMedias)[number];

function isAllowedMedia(media: string): media is Media {
  return allowedMedias.includes(media as Media);
}

export class StatisticController {
  constructor(private readonly statisticService: StatisticService) {}

  getYearRange = async (_: Request, res: Response, next: NextFunction) => {
    try {
      const years = await this.statisticService.getYearRange();

      return res.json({ data: years });
    } catch (error) {
      return next(error);
    }
  };

  getMediaConsumption = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const parsedQuery = querySchema.safeParse(req.query);

      if (!parsedQuery.success) {
        throw new UnprocessableEntityError("Invalid query parameters!");
      }

      const { view, year } = parsedQuery.data;

      let parsedYear: number | undefined;
      if (year) {
        parsedYear = parseInt(year as string, 10);
        if (isNaN(parsedYear) || parsedYear < 0) {
          throw new BadRequestError("Invalid year specified!");
        }
      }

      if (view === STATISTICS_VIEW.MONTHLY && parsedYear === undefined) {
        throw new BadRequestError("Year must be provided for monthly view!");
      }

      const statistics = await this.statisticService.generateMediaConsumption(
        view as STATISTICS_VIEW,
        parsedYear
      );

      return res.json({ data: statistics });
    } catch (error) {
      return next(error);
    }
  };

  getMediaProgress = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const media = req.query.media as string;

      if (!media) {
        throw new UnprocessableEntityError("Media params missing!");
      }

      if (!isAllowedMedia(media)) {
        throw new BadRequestError(
          "Only anime, manga, or lightNovel media is allowed!"
        );
      }

      const statistics =
        await this.statisticService.generateMediaProgress(media);

      return res.json({ data: statistics });
    } catch (error) {
      return next(error);
    }
  };

  getGenreConsumption = async (
    _: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const statistics = await this.statisticService.generateGenreConsumption();

      return res.json({ data: statistics });
    } catch (error) {
      return next(error);
    }
  };

  getStudioConsumption = async (
    _: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const statistics =
        await this.statisticService.generateStudioConsumption();

      return res.json({ data: statistics });
    } catch (error) {
      return next(error);
    }
  };

  getThemeConsumption = async (
    _: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const statistics = await this.statisticService.generateThemeConsumption();

      return res.json({ data: statistics });
    } catch (error) {
      return next(error);
    }
  };

  getAuthorConsumption = async (
    _: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const statistics =
        await this.statisticService.generateAuthorConsumption();

      return res.json({ data: statistics });
    } catch (error) {
      return next(error);
    }
  };

  getAllTimeStatistics = async (
    _: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const statistics = await this.statisticService.getAllTimeStatistics();

      return res.json({ data: statistics });
    } catch (error) {
      return next(error);
    }
  };

  getEachMediaTopScoreAndYearlyCount = async (
    _: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const statistics =
        await this.statisticService.getEachMediaTopScoreAndYearlyCount();

      return res.json({ data: statistics });
    } catch (error) {
      return next(error);
    }
  };
}
