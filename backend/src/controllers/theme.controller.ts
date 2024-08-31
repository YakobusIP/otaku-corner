import { Request, Response } from "express";
import { ThemeService } from "../services/theme.service";

export class ThemeController {
  constructor(private readonly themeService: ThemeService) {}

  getAllThemes = async (_: Request, res: Response): Promise<void> => {
    try {
      const themes = await this.themeService.getAllThemes();
      res.json({ data: themes });
    } catch (error) {
      res.status(500).json({ error });
    }
  };
}
