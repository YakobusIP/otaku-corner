import { Request, Response } from "express";
import { GenreService } from "../services/genre.service";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export class GenreController {
  constructor(private readonly genreService: GenreService) {}

  getAllGenres = async (req: Request, res: Response): Promise<void> => {
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
      res.json({ data: genres });
    } catch (error) {
      res.status(500).json({ error });
    }
  };

  createGenre = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.genreService.createGenre(req.body);
      res.status(201).json({ message: "Genre created successfully!" });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        res.status(409).json({ error: "Genre already exists!" });
      } else {
        res.status(500).json({ error });
      }
    }
  };

  updateGenre = async (req: Request, res: Response): Promise<void> => {
    try {
      const updatedGenre = await this.genreService.updateGenre(
        parseInt(req.params.id),
        req.body
      );
      if (updatedGenre) {
        res.json({ message: "Genre updated successfully!" });
      } else {
        res.status(404).json({ error: "Genre not found!" });
      }
    } catch (error) {
      res.status(500).json({ error });
    }
  };

  deleteGenre = async (req: Request, res: Response): Promise<void> => {
    try {
      const deletedGenre = await this.genreService.deleteGenre(
        parseInt(req.params.id)
      );
      if (deletedGenre) {
        res.status(204).end();
      } else {
        res.status(404).json({ error: "Genre not found!" });
      }
    } catch (error) {
      res.status(500).json({ error });
    }
  };

  deleteMultipleGenres = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.genreService.deleteMultipleGenres(req.body.ids);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error });
    }
  };
}
