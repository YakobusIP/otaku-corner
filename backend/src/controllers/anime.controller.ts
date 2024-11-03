import { Request, Response, NextFunction } from "express";
import { AnimeService } from "../services/anime.service";
import { Prisma } from "@prisma/client";
import { UnprocessableEntityError } from "../lib/error";
import { fetchEpisodesQueue } from "../lib/queues/anime.queue";

export class AnimeController {
  constructor(private readonly animeService: AnimeService) {}

  getAllAnimes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentPage = req.query.currentPage as string;
      const limitPerPage = req.query.limitPerPage as string;

      if (!currentPage || !limitPerPage) {
        throw new UnprocessableEntityError("Pagination query params missing!");
      }

      const query = req.query.q as string;
      const sortBy = req.query.sortBy as string;
      const sortOrder = req.query.sortOrder as Prisma.SortOrder;
      const filterGenre = req.query.filterGenre as string;
      const filterStudio = req.query.filterStudio as string;
      const filterTheme = req.query.filterTheme as string;
      const filterMALScore = req.query.filterMALScore as string;
      const filterPersonalScore = req.query.filterPersonalScore as string;
      const filterType = req.query.filterType as string;
      const animes = await this.animeService.getAllAnimes(
        parseInt(currentPage),
        parseInt(limitPerPage),
        query,
        sortBy,
        sortOrder,
        filterGenre,
        filterStudio,
        filterTheme,
        filterMALScore,
        filterPersonalScore,
        filterType
      );

      return res.json({ data: animes });
    } catch (error) {
      return next(error);
    }
  };

  getAnimeById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const anime = await this.animeService.getAnimeById(req.params.id);
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
          fetchEpisodesQueue.add({ anime_id: anime.id, mal_id: anime.malId });
        }
      });
    } catch (error) {
      return next(error);
    }
  };

  updateAnime = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.animeService.updateAnime(req.params.id, req.body);
      return res.json({ message: "Anime updated successfully!" });
    } catch (error) {
      return next(error);
    }
  };

  deleteAnime = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.animeService.deleteAnime(req.params.id);
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
}
