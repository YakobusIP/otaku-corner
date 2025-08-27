import { Request, Response, NextFunction } from "express";
import { MangaService } from "../services/manga.service";
import { Prisma, ProgressStatus } from "@prisma/client";
import { UnprocessableEntityError } from "../lib/error";
import { fetchMangaDataQueue } from "../lib/queues/manga.queue";

export class MangaController {
  constructor(private readonly mangaService: MangaService) {}

  getAllMangas = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = req.query.page as string;
      const limit = req.query.limit as string;

      if (!page || !limit) {
        throw new UnprocessableEntityError("Pagination query params missing!");
      }

      const query = req.query.q as string;
      const sort = req.query.sort as string;
      const order = req.query.order as Prisma.SortOrder;
      const author = parseInt(req.query.author as string);
      const genre = parseInt(req.query.genre as string);
      const theme = parseInt(req.query.theme as string);
      const status = req.query.status as ProgressStatus;
      const mal_score = req.query.mal_score as string;
      const personal_score = req.query.personal_score as string;
      const status_check = req.query.status_check as string;
      const mangas = await this.mangaService.getAllMangas(
        parseInt(page),
        parseInt(limit),
        query,
        sort,
        order,
        author,
        genre,
        theme,
        status,
        mal_score,
        personal_score,
        status_check
      );

      return res.json({ data: mangas });
    } catch (error) {
      return next(error);
    }
  };

  getMangaById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const manga = await this.mangaService.getMangaById(
        parseInt(req.params.id)
      );
      return res.json({ data: manga });
    } catch (error) {
      return next(error);
    }
  };

  getMangaDuplicate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const exists = await this.mangaService.getMangaDuplicate(
        parseInt(req.params.id)
      );
      return res.json({ exists });
    } catch (error) {
      return next(error);
    }
  };

  createMangaBulk = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const mangaList = await this.mangaService.createMangaBulk(req.body.data);
      res.status(201).json({ message: "Manga(s) created successfully!" });

      mangaList.forEach((manga) => {
        if (manga.status !== "Upcoming") {
          fetchMangaDataQueue.add({
            id: manga.id,
            title: manga.title,
            titleJapanese: manga.titleJapanese
          });
        }
      });
    } catch (error) {
      return next(error);
    }
  };

  updateManga = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.mangaService.updateManga(parseInt(req.params.id), req.body);
      return res.json({ message: "Manga updated successfully!" });
    } catch (error) {
      return next(error);
    }
  };

  updateMangaReview = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await this.mangaService.updateMangaReview(
        parseInt(req.params.id),
        req.body
      );
      return res.json({ message: "Manga review updated successfully!" });
    } catch (error) {
      return next(error);
    }
  };

  deleteManga = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.mangaService.deleteManga(parseInt(req.params.id));
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

  getTotalData = async (_: Request, res: Response, next: NextFunction) => {
    try {
      const count = await this.mangaService.getTotalData();
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

      const manga = await this.mangaService.getSitemapData(
        parseInt(page),
        parseInt(limit)
      );
      return res.json({ data: manga });
    } catch (error) {
      return next(error);
    }
  };

  getMangaStatusCounts = async (
    _: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const statusCounts = await this.mangaService.getMangaStatusCounts();
      return res.json({ data: statusCounts });
    } catch (error) {
      return next(error);
    }
  };
}
