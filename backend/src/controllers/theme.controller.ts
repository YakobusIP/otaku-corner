import { Request, Response } from "express";
import { ThemeService } from "../services/theme.service";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export class ThemeController {
  constructor(private readonly themeService: ThemeService) {}

  getAllThemes = async (req: Request, res: Response): Promise<void> => {
    try {
      const connected_media = req.query.connected_media === "true";
      const currentPage = req.query.currentPage as string;
      const limitPerPage = req.query.limitPerPage as string;
      const query = req.query.q as string;

      const themes = await this.themeService.getAllThemes(
        connected_media,
        parseInt(currentPage),
        parseInt(limitPerPage),
        query
      );
      res.json({ data: themes });
    } catch (error) {
      res.status(500).json({ error });
    }
  };

  createTheme = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.themeService.createTheme(req.body);
      res.status(201).json({ message: "Theme created successfully!" });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        res.status(409).json({ error: "Theme already exists!" });
      } else {
        res.status(500).json({ error });
      }
    }
  };

  updateTheme = async (req: Request, res: Response): Promise<void> => {
    try {
      const updatedTheme = await this.themeService.updateTheme(
        req.params.id,
        req.body
      );
      if (updatedTheme) {
        res.json({ message: "Theme updated successfully!" });
      } else {
        res.status(404).json({ error: "Theme not found!" });
      }
    } catch (error) {
      res.status(500).json({ error });
    }
  };

  deleteTheme = async (req: Request, res: Response): Promise<void> => {
    try {
      const deletedTheme = await this.themeService.deleteTheme(req.params.id);
      if (deletedTheme) {
        res.status(204).end();
      } else {
        res.status(404).json({ error: "Theme not found!" });
      }
    } catch (error) {
      res.status(500).json({ error });
    }
  };

  deleteMultipleThemes = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.themeService.deleteMultipleThemes(req.body.ids);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error });
    }
  };
}
