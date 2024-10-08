import { Request, Response, NextFunction } from "express";
import { MangaService } from "../services/manga.service";
import { Prisma } from "@prisma/client";
import { UnprocessableEntityError } from "../lib/error";

export class MangaController {
  constructor(private readonly mangaService: MangaService) {}

  getAllMangas = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentPage = req.query.currentPage as string;
      const limitPerPage = req.query.limitPerPage as string;

      if (!currentPage || !limitPerPage) {
        throw new UnprocessableEntityError("Pagination query params missing");
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

      return res.json({ data: mangas });
    } catch (error) {
      return next(error);
    }
  };

  getMangaById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const manga = await this.mangaService.getMangaById(req.params.id);
      return res.json({ data: manga });
    } catch (error) {
      return next(error);
    }
  };

  createManga = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.mangaService.createManga(req.body);
      return res.status(201).json({ message: "Manga created successfully!" });
    } catch (error) {
      return next(error);
    }
  };

  updateManga = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.mangaService.updateManga(req.params.id, req.body);
      return res.json({ message: "Manga updated successfully!" });
    } catch (error) {
      return next(error);
    }
  };

  deleteManga = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.mangaService.deleteManga(req.params.id);
      return res.status(204).end();
    } catch (error) {
      return next(error);
    }
  };

  deleteMultipleMangas = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await this.mangaService.deleteMultipleMangas(req.body.ids);
      return res.status(204).end();
    } catch (error) {
      return next(error);
    }
  };
}
