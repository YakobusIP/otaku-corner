import { Request, Response, NextFunction } from "express";
import { ThemeService } from "../services/theme.service";

export class ThemeController {
  constructor(private readonly themeService: ThemeService) {}

  /**
   * @todo Make currentPage and limitPerPage mandatory (changes in the FE as well)
   */
  getAllThemes = async (req: Request, res: Response, next: NextFunction) => {
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

      return res.json({ data: themes });
    } catch (error) {
      return next(error);
    }
  };

  createTheme = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.themeService.createTheme(req.body);
      return res.status(201).json({ message: "Theme created successfully!" });
    } catch (error) {
      return next(error);
    }
  };

  updateTheme = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.themeService.updateTheme(req.params.id, req.body);
      return res.json({ message: "Theme updated successfully!" });
    } catch (error) {
      return next(error);
    }
  };

  deleteTheme = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.themeService.deleteTheme(req.params.id);
      return res.status(204).end();
    } catch (error) {
      return next(error);
    }
  };

  deleteMultipleThemes = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await this.themeService.deleteMultipleThemes(req.body.ids);
      return res.status(204).end();
    } catch (error) {
      return next(error);
    }
  };
}
