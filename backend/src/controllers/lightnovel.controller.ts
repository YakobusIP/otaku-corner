import { Request, Response } from "express";
import { LightNovelService } from "../services/lightnovel.service";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { Prisma } from "@prisma/client";

export class LightNovelController {
  constructor(private readonly lightNovelService: LightNovelService) {}

  getAllLightNovels = async (req: Request, res: Response): Promise<void> => {
    try {
      const currentPage = req.query.currentPage as string;
      const limitPerPage = req.query.limitPerPage as string;

      if (!currentPage || !limitPerPage) {
        res.status(422).json({ error: "Pagination query params missing" });
        return;
      }
      const query = req.query.q as string;
      const sortBy = req.query.sortBy as string;
      const sortOrder = req.query.sortOrder as Prisma.SortOrder;
      const filterAuthor = req.query.filterAuthor as string;
      const filterGenre = req.query.filterGenre as string;
      const filterTheme = req.query.filterTheme as string;
      const filterMALScore = req.query.filterMALScore as string;
      const filterPersonalScore = req.query.filterPersonalScore as string;
      const lightNovels = await this.lightNovelService.getAllLightNovels(
        parseInt(currentPage),
        parseInt(limitPerPage),
        query,
        sortBy,
        sortOrder,
        filterAuthor,
        filterGenre,
        filterTheme,
        filterMALScore,
        filterPersonalScore
      );
      res.json({ data: lightNovels });
    } catch (error) {
      res.status(500).json({ error });
    }
  };

  getLightNovelById = async (req: Request, res: Response): Promise<void> => {
    try {
      const lightNovel = await this.lightNovelService.getLightNovelById(
        req.params.id
      );
      if (lightNovel) {
        res.json({ data: lightNovel });
      } else {
        res.status(404).json({ error: "Light novel not found!" });
      }
    } catch (error) {
      res.status(500).json({ error });
    }
  };

  createLightNovel = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.lightNovelService.createLightNovel(req.body);
      res.status(201).json({ message: "Light novel created successfully!" });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        res.status(409).json({ error: "Light novel already exists!" });
      } else {
        res.status(500).json({ error });
      }
    }
  };

  updateLightNovel = async (req: Request, res: Response): Promise<void> => {
    try {
      const updatedLightNovel = await this.lightNovelService.updateLightNovel(
        req.params.id,
        req.body
      );
      if (updatedLightNovel) {
        res.json({ data: updatedLightNovel });
      } else {
        res.status(404).json({ error: "Light novel not found!" });
      }
    } catch (error) {
      res.status(500).json({ error });
    }
  };

  updateLightNovelReview = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const updatedLightNovel =
        await this.lightNovelService.updateLightNovelReview(
          req.params.id,
          req.body
        );
      if (updatedLightNovel) {
        res.json({ message: "Review updated successfully!" });
      } else {
        res.status(404).json({ error: "Light novel not found!" });
      }
    } catch (error) {
      res.status(500).json({ error });
    }
  };

  updateLightNovelProgressStatus = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const updatedLightNovel =
        await this.lightNovelService.updateLightNovelProgressStatus(
          req.params.id,
          req.body
        );
      if (updatedLightNovel) {
        res.json({ message: "Progress status updated successfully!" });
      } else {
        res.status(404).json({ error: "Light novel not found!" });
      }
    } catch (error) {
      res.status(500).json({ error });
    }
  };

  deleteLightNovel = async (req: Request, res: Response): Promise<void> => {
    try {
      const deletedLightNovel = await this.lightNovelService.deleteLightNovel(
        req.params.id
      );
      if (deletedLightNovel) {
        res.status(204).end();
      } else {
        res.status(404).json({ error: "Light novel not found!" });
      }
    } catch (error) {
      res.status(500).json({ error });
    }
  };

  deleteMultipleLightNovels = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      await this.lightNovelService.deleteMultipleLightNovels(req.body.ids);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error });
    }
  };
}
