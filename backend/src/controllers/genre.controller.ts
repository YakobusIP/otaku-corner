import { Request, Response } from "express";
import { GenreService } from "../services/genre.service";

export class GenreController {
  constructor(private readonly genreService: GenreService) {}

  getAllGenres = async (_: Request, res: Response): Promise<void> => {
    try {
      const genres = await this.genreService.getAllGenres();
      res.json({ data: genres });
    } catch (error) {
      res.status(500).json({ error });
    }
  };
}
