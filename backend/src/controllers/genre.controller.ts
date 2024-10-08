import { Request, Response, NextFunction } from "express";
import { GenreService } from "../services/genre.service";

export class GenreController {
  constructor(private readonly genreService: GenreService) {}

  /**
   * @todo Make currentPage and limitPerPage mandatory (changes in the FE as well)
   */
  getAllGenres = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const connected_media = req.query.connected_media === "true";
      const currentPage = req.query.currentPage as string;
      const limitPerPage = req.query.limitPerPage as string;
      const query = req.query.q as string;

      const genres = await this.genreService.getAllGenres(
        connected_media,
        parseInt(currentPage),
        parseInt(limitPerPage),
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
      await this.genreService.updateGenre(req.params.id, req.body);
      return res.json({ message: "Genre updated successfully!" });
    } catch (error) {
      return next(error);
    }
  };

  deleteGenre = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.genreService.deleteGenre(req.params.id);
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
