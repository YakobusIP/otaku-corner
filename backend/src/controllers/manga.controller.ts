import { Request, Response } from "express";
import { MangaService } from "../services/manga.service";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { Prisma } from "@prisma/client";

export class MangaController {
  constructor(private readonly mangaService: MangaService) {}

  getAllMangas = async (req: Request, res: Response): Promise<void> => {
    try {
      const currentPage = req.query.currentPage as string;
      const limitPerPage = req.query.limitPerPage as string;

      if (!currentPage || !limitPerPage) {
        res.status(422).json({ error: "Pagination query params missing" });
        return;
      }
      const query = req.query.q as string;
      const sortBy = req.query.sortBy as string;
      const sortOrder = req.query.sortOrder as Prisma.SortOrder;
      const filterAuthor = req.query.filterAuthor as string;
      const filterGenre = req.query.filterGenre as string;
      const filterTheme = req.query.filterTheme as string;
      const filterMALScore = req.query.filterMALScore as string;
      const filterPersonalScore = req.query.filterPersonalScore as string;
      const mangas = await this.mangaService.getAllMangas(
        parseInt(currentPage),
        parseInt(limitPerPage),
        query,
        sortBy,
        sortOrder,
        filterAuthor,
        filterGenre,
        filterTheme,
        filterMALScore,
        filterPersonalScore
      );
      res.json({ data: mangas });
    } catch (error) {
      res.status(500).json({ error });
    }
  };

  getMangaById = async (req: Request, res: Response): Promise<void> => {
    try {
      const manga = await this.mangaService.getMangaById(req.params.id);
      if (manga) {
        res.json({ data: manga });
      } else {
        res.status(404).json({ error: "Manga not found!" });
      }
    } catch (error) {
      res.status(500).json({ error });
    }
  };

  createManga = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.mangaService.createManga(req.body);
      res.status(201).json({ message: "Manga created successfully!" });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        res.status(409).json({ error: "Manga already exists!" });
      } else {
        res.status(500).json({ error });
      }
    }
  };

  updateManga = async (req: Request, res: Response): Promise<void> => {
    try {
      const updatedManga = await this.mangaService.updateManga(
        req.params.id,
        req.body
      );
      if (updatedManga) {
        res.json({ data: updatedManga });
      } else {
        res.status(404).json({ error: "Manga not found!" });
      }
    } catch (error) {
      res.status(500).json({ error });
    }
  };

  updateMangaReview = async (req: Request, res: Response): Promise<void> => {
    try {
      const updatedManga = await this.mangaService.updateMangaReview(
        req.params.id,
        req.body
      );
      if (updatedManga) {
        res.json({ message: "Review updated successfully!" });
      } else {
        res.status(404).json({ error: "Manga not found!" });
      }
    } catch (error) {
      res.status(500).json({ error });
    }
  };

  updateMangaProgressStatus = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const updatedManga = await this.mangaService.updateMangaProgressStatus(
        req.params.id,
        req.body
      );
      if (updatedManga) {
        res.json({ message: "Progress status updated successfully!" });
      } else {
        res.status(404).json({ error: "Manga not found!" });
      }
    } catch (error) {
      res.status(500).json({ error });
    }
  };

  deleteManga = async (req: Request, res: Response): Promise<void> => {
    try {
      const deletedManga = await this.mangaService.deleteManga(req.params.id);
      if (deletedManga) {
        res.status(204).end();
      } else {
        res.status(404).json({ error: "Manga not found!" });
      }
    } catch (error) {
      res.status(500).json({ error });
    }
  };

  deleteMultipleMangas = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.mangaService.deleteMultipleMangas(req.body.ids);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error });
    }
  };
}
