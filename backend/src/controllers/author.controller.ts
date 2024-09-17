import { Request, Response } from "express";
import { AuthorService } from "../services/author.service";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  getAllAuthors = async (req: Request, res: Response): Promise<void> => {
    try {
      const connected_media = req.query.connected_media === "true";
      const currentPage = req.query.currentPage as string;
      const limitPerPage = req.query.limitPerPage as string;
      const query = req.query.q as string;

      const authors = await this.authorService.getAllAuthors(
        connected_media,
        parseInt(currentPage),
        parseInt(limitPerPage),
        query
      );
      res.json({ data: authors });
    } catch (error) {
      res.status(500).json({ error });
    }
  };

  createAuthor = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.authorService.createAuthor(req.body);
      res.status(201).json({ message: "Author created successfully!" });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        res.status(409).json({ error: "Author already exists!" });
      } else {
        res.status(500).json({ error });
      }
    }
  };

  updateAuthor = async (req: Request, res: Response): Promise<void> => {
    try {
      const updatedAuthor = await this.authorService.updateAuthor(
        parseInt(req.params.id),
        req.body
      );
      if (updatedAuthor) {
        res.json({ message: "Author updated successfully!" });
      } else {
        res.status(404).json({ error: "Author not found!" });
      }
    } catch (error) {
      res.status(500).json({ error });
    }
  };

  deleteAuthor = async (req: Request, res: Response): Promise<void> => {
    try {
      const deletedAuthor = await this.authorService.deleteAuthor(
        parseInt(req.params.id)
      );
      if (deletedAuthor) {
        res.status(204).end();
      } else {
        res.status(404).json({ error: "Author not found!" });
      }
    } catch (error) {
      res.status(500).json({ error });
    }
  };

  deleteMultipleAuthors = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      await this.authorService.deleteMultipleAuthors(req.body.ids);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error });
    }
  };
}
