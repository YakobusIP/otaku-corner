import { Request, Response } from "express";
import { StudioService } from "../services/studio.service";

export class StudioController {
  constructor(private readonly studioService: StudioService) {}

  getAllStudios = async (_: Request, res: Response): Promise<void> => {
    try {
      const studios = await this.studioService.getAllStudios();
      res.json({ data: studios });
    } catch (error) {
      res.status(500).json({ error });
    }
  };
}
