import { Request, Response, NextFunction } from "express";
import { StudioService } from "../services/studio.service";

export class StudioController {
  constructor(private readonly studioService: StudioService) {}

  /**
   * @todo Make currentPage and limitPerPage mandatory (changes in the FE as well)
   */
  getAllStudios = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const connected_media = req.query.connected_media === "true";
      const currentPage = req.query.currentPage as string;
      const limitPerPage = req.query.limitPerPage as string;
      const query = req.query.q as string;

      const studios = await this.studioService.getAllStudios(
        connected_media,
        parseInt(currentPage),
        parseInt(limitPerPage),
        query
      );

      return res.json({ data: studios });
    } catch (error) {
      return next(error);
    }
  };

  createStudio = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.studioService.createStudio(req.body);
      return res.status(201).json({ message: "Studio created successfully!" });
    } catch (error) {
      return next(error);
    }
  };

  updateStudio = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.studioService.updateStudio(parseInt(req.params.id), req.body);
      return res.json({ message: "Studio updated successfully!" });
    } catch (error) {
      return next(error);
    }
  };

  deleteStudio = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.studioService.deleteStudio(parseInt(req.params.id));
      return res.status(204).end();
    } catch (error) {
      return next(error);
    }
  };

  deleteMultipleStudios = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await this.studioService.deleteMultipleStudios(req.body.ids);
      return res.status(204).end();
    } catch (error) {
      return next(error);
    }
  };
}
