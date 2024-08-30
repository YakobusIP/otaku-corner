import { Request, Response } from "express";
import { AnimeService } from "../services/anime.service";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { Prisma } from "@prisma/client";

export class AnimeController {
  constructor(private readonly animeService: AnimeService) {}

  getAllAnimes = async (req: Request, res: Response): Promise<void> => {
    try {
      const query = req.query.q as string;
      const sortBy = req.query.sortBy as string;
      const sortOrder = req.query.sortOrder as Prisma.SortOrder;
      const filterGenre = req.query.filterGenre as string;
      const filterScore = req.query.filterScore as string;
      const filterType = req.query.filterType as string;
      const animes = await this.animeService.getAllAnimes(
        query,
        sortBy,
        sortOrder,
        parseInt(filterGenre),
        filterScore,
        filterType
      );
      res.json({ data: animes });
    } catch (error) {
      res.status(500).json({ error });
    }
  };

  getAnimeById = async (req: Request, res: Response): Promise<void> => {
    try {
      const anime = await this.animeService.getAnimeById(
        parseInt(req.params.id)
      );
      if (anime) {
        res.json({ data: anime });
      } else {
        res.status(404).json({ error: "Anime not found!" });
      }
    } catch (error) {
      res.status(500).json({ error });
    }
  };

  createAnime = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.animeService.createAnime(req.body);
      res.status(201).json({ message: "Anime created successfully!" });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        res.status(409).json({ error: "Anime already exists!" });
      } else {
        res.status(500).json({ error });
      }
    }
  };

  updateAnime = async (req: Request, res: Response): Promise<void> => {
    try {
      const updatedAnime = await this.animeService.updateAnime(
        parseInt(req.params.id),
        req.body
      );
      if (updatedAnime) {
        res.json({ data: updatedAnime });
      } else {
        res.status(404).json({ error: "Anime not found!" });
      }
    } catch (error) {
      res.status(500).json({ error });
    }
  };

  updateAnimeReview = async (req: Request, res: Response): Promise<void> => {
    try {
      const updatedAnime = await this.animeService.updateAnimeReview(
        parseInt(req.params.id),
        req.body
      );
      if (updatedAnime) {
        res.json({ message: "Review updated successfully!" });
      } else {
        res.status(404).json({ error: "Anime not found!" });
      }
    } catch (error) {
      res.status(500).json({ error });
    }
  };

  deleteAnime = async (req: Request, res: Response): Promise<void> => {
    try {
      const deletedAnime = await this.animeService.deleteAnime(
        parseInt(req.params.id)
      );
      if (deletedAnime) {
        res.status(204).end();
      } else {
        res.status(404).json({ error: "Anime not found!" });
      }
    } catch (error) {
      res.status(500).json({ error });
    }
  };

  deleteMultipleAnime = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.animeService.deleteMultipleAnime(req.body.ids);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error });
    }
  };
}
