import { Request, Response, NextFunction } from "express";
import { GenreService } from "../services/genre.service";

export class GenreController {
  constructor(private readonly genreService: GenreService) {}

  getAllGenres = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const connected_media = req.query.connected_media === "true";
      const page = req.query.page as string;
      const limit = req.query.limit as string;
      const query = req.query.q as string;

      const genres = await this.genreService.getAllGenres(
        connected_media,
        page ? parseInt(page) : undefined,
        limit ? parseInt(limit) : undefined,
        query
      );

      return res.json({ data: genres });
    } catch (error) {
      return next(error);
    }
  };

  createGenre = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.genreService.createGenre(req.body);
      return res.status(201).json({ message: "Genre created successfully!" });
    } catch (error) {
      return next(error);
    }
  };

  updateGenre = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.genreService.updateGenre(parseInt(req.params.id), req.body);
      return res.json({ message: "Genre updated successfully!" });
    } catch (error) {
      return next(error);
    }
  };

  deleteGenre = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.genreService.deleteGenre(parseInt(req.params.id));
      return res.status(204).end();
    } catch (error) {
      return next(error);
    }
  };

  deleteMultipleGenres = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await this.genreService.deleteMultipleGenres(req.body.ids);
      return res.status(204).end();
    } catch (error) {
      return next(error);
    }
  };
}
