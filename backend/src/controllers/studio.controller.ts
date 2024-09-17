import { Request, Response } from "express";
import { StudioService } from "../services/studio.service";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export class StudioController {
  constructor(private readonly studioService: StudioService) {}

  getAllStudios = async (req: Request, res: Response): Promise<void> => {
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
      res.json({ data: studios });
    } catch (error) {
      res.status(500).json({ error });
    }
  };

  createStudio = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.studioService.createStudio(req.body);
      res.status(201).json({ message: "Studio created successfully!" });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        res.status(409).json({ error: "Studio already exists!" });
      } else {
        res.status(500).json({ error });
      }
    }
  };

  updateStudio = async (req: Request, res: Response): Promise<void> => {
    try {
      const updatedStudio = await this.studioService.updateStudio(
        parseInt(req.params.id),
        req.body
      );
      if (updatedStudio) {
        res.json({ message: "Studio updated successfully!" });
      } else {
        res.status(404).json({ error: "Studio not found!" });
      }
    } catch (error) {
      res.status(500).json({ error });
    }
  };

  deleteStudio = async (req: Request, res: Response): Promise<void> => {
    try {
      const deletedStudio = await this.studioService.deleteStudio(
        parseInt(req.params.id)
      );
      if (deletedStudio) {
        res.status(204).end();
      } else {
        res.status(404).json({ error: "Studio not found!" });
      }
    } catch (error) {
      res.status(500).json({ error });
    }
  };

  deleteMultipleStudios = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      await this.studioService.deleteMultipleStudios(req.body.ids);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error });
    }
  };
}
