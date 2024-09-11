import { Request, Response } from "express";
import { AuthorService } from "../services/author.service";

export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  getAllAuthors = async (_: Request, res: Response): Promise<void> => {
    try {
      const authors = await this.authorService.getAllAuthors();
      res.json({ data: authors });
    } catch (error) {
      res.status(500).json({ error });
    }
  };
}
