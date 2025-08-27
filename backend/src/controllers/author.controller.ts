import { Request, Response, NextFunction } from "express";
import { AuthorService } from "../services/author.service";

export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  /**
   * @todo Make currentPage and limitPerPage mandatory (changes in the FE as well)
   */
  getAllAuthors = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const connected_media = req.query.connected_media === "true";
      const page = req.query.page as string;
      const limit = req.query.limit as string;
      const query = req.query.q as string;

      const authors = await this.authorService.getAllAuthors(
        connected_media,
        parseInt(page),
        parseInt(limit),
        query
      );

      return res.json({ data: authors });
    } catch (error) {
      return next(error);
    }
  };

  createAuthor = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.authorService.createAuthor(req.body);
      return res.status(201).json({ message: "Author created successfully!" });
    } catch (error) {
      return next(error);
    }
  };

  updateAuthor = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.authorService.updateAuthor(parseInt(req.params.id), req.body);
      return res.json({ message: "Author updated successfully!" });
    } catch (error) {
      return next(error);
    }
  };

  deleteAuthor = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.authorService.deleteAuthor(parseInt(req.params.id));
      return res.status(204).end();
    } catch (error) {
      return next(error);
    }
  };

  deleteMultipleAuthors = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await this.authorService.deleteMultipleAuthors(req.body.ids);
      return res.status(204).end();
    } catch (error) {
      return next(error);
    }
  };
}
