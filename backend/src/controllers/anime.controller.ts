import { Request, Response, NextFunction } from "express";
import { AnimeService } from "../services/anime.service";
import { Prisma, ProgressStatus } from "@prisma/client";
import { UnprocessableEntityError } from "../lib/error";
import { fetchEpisodesQueue } from "../lib/queues/anime.queue";

export class AnimeController {
  constructor(private readonly animeService: AnimeService) {}

  getAllAnimes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = req.query.page as string;
      const limit = req.query.limit as string;

      if (!page || !limit) {
        throw new UnprocessableEntityError("Pagination query params missing!");
      }

      const query = req.query.q as string;
      const sort = req.query.sort as string;
      const order = req.query.order as Prisma.SortOrder;
      const genre = parseInt(req.query.genre as string);
      const studio = parseInt(req.query.studio as string);
      const theme = parseInt(req.query.theme as string);
      const status = req.query.status as ProgressStatus;
      const mal_score = req.query.mal_score as string;
      const personal_score = req.query.personal_score as string;
      const type = req.query.type as string;
      const status_check = req.query.status_check as string;
      const animes = await this.animeService.getAllAnimes(
        parseInt(page),
        parseInt(limit),
        query,
        sort,
        order,
        genre,
        studio,
        theme,
        status,
        mal_score,
        personal_score,
        type,
        status_check
      );

      return res.json({ data: animes });
    } catch (error) {
      return next(error);
    }
  };

  getAnimeById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const anime = await this.animeService.getAnimeById(
        parseInt(req.params.id)
      );
      return res.json({ data: anime });
    } catch (error) {
      return next(error);
    }
  };

  getAnimeDuplicate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const exists = await this.animeService.getAnimeDuplicate(
        parseInt(req.params.id)
      );
      return res.json({ exists });
    } catch (error) {
      return next(error);
    }
  };

  createAnimeBulk = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const animeList = await this.animeService.createAnimeBulk(req.body.data);
      res.status(201).json({ message: "Anime(s) created successfully!" });

      animeList.forEach((anime) => {
        if (!["Movie", "OVA"].includes(anime.type)) {
          fetchEpisodesQueue.add({ id: anime.id });
        }
      });
    } catch (error) {
      return next(error);
    }
  };

  updateAnime = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.animeService.updateAnime(parseInt(req.params.id), req.body);
      return res.json({ message: "Anime updated successfully!" });
    } catch (error) {
      return next(error);
    }
  };

  updateAnimeReview = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await this.animeService.updateAnimeReview(
        parseInt(req.params.id),
        req.body
      );
      return res.json({ message: "Anime review updated successfully!" });
    } catch (error) {
      return next(error);
    }
  };

  deleteAnime = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.animeService.deleteAnime(parseInt(req.params.id));
      return res.status(204).end();
    } catch (error) {
      return next(error);
    }
  };

  deleteMultipleAnimes = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await this.animeService.deleteMultipleAnimes(req.body.ids);
      return res.status(204).end();
    } catch (error) {
      return next(error);
    }
  };

  getTotalData = async (_: Request, res: Response, next: NextFunction) => {
    try {
      const count = await this.animeService.getTotalData();
      return res.json({ count });
    } catch (error) {
      return next(error);
    }
  };

  getSitemapData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = req.query.page as string;
      const limit = req.query.limit as string;

      if (!page || !limit) {
        throw new UnprocessableEntityError("Pagination query params missing!");
      }

      const anime = await this.animeService.getSitemapData(
        parseInt(page),
        parseInt(limit)
      );
      return res.json({ data: anime });
    } catch (error) {
      return next(error);
    }
  };

  getAnimeStatusCounts = async (
    _: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const statusCounts = await this.animeService.getAnimeStatusCounts();
      return res.json({ data: statusCounts });
    } catch (error) {
      return next(error);
    }
  };
}
