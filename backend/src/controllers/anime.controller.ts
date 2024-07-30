import { Request, Response } from "express";
import { AnimeService } from "../services/anime.service";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export class AnimeController {
  private animeService: AnimeService;

  constructor(animeService: AnimeService) {
    this.animeService = animeService;
  }

  getAllAnimes = async (_: Request, res: Response): Promise<void> => {
    try {
      const animes = await this.animeService.getAllAnimes();
      res.json({ data: animes });
    } catch (error) {
      res.status(500).json({ error });
    }
  };

  getAnimeById = async (req: Request, res: Response): Promise<void> => {
    try {
      const anime = await this.animeService.getAnimeById(req.params.id);
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
        req.params.id,
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

  deleteAnime = async (req: Request, res: Response): Promise<void> => {
    try {
      const deletedAnime = await this.animeService.deleteAnime(req.params.id);
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
