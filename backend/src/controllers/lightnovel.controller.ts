import { Request, Response, NextFunction } from "express";
import { LightNovelService } from "../services/lightnovel.service";
import { Prisma, ProgressStatus } from "@prisma/client";
import { UnprocessableEntityError } from "../lib/error";

export class LightNovelController {
  constructor(private readonly lightNovelService: LightNovelService) {}

  getAllLightNovels = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const currentPage = req.query.currentPage as string;
      const limitPerPage = req.query.limitPerPage as string;

      if (!currentPage || !limitPerPage) {
        throw new UnprocessableEntityError("Pagination query params missing!");
      }

      const query = req.query.q as string;
      const sortBy = req.query.sortBy as string;
      const sortOrder = req.query.sortOrder as Prisma.SortOrder;
      const filterAuthor = parseInt(req.query.filterAuthor as string);
      const filterGenre = parseInt(req.query.filterGenre as string);
      const filterTheme = parseInt(req.query.filterTheme as string);
      const filterProgressStatus = req.query
        .filterProgressStatus as ProgressStatus;
      const filterMALScore = req.query.filterMALScore as string;
      const filterPersonalScore = req.query.filterPersonalScore as string;
      const filterStatusCheck = req.query.filterStatusCheck as string;
      const lightNovels = await this.lightNovelService.getAllLightNovels(
        parseInt(currentPage),
        parseInt(limitPerPage),
        query,
        sortBy,
        sortOrder,
        filterAuthor,
        filterGenre,
        filterTheme,
        filterProgressStatus,
        filterMALScore,
        filterPersonalScore,
        filterStatusCheck
      );

      return res.json({ data: lightNovels });
    } catch (error) {
      return next(error);
    }
  };

  getLightNovelById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const lightNovel = await this.lightNovelService.getLightNovelById(
        parseInt(req.params.id)
      );
      return res.json({ data: lightNovel });
    } catch (error) {
      return next(error);
    }
  };

  getLightNovelDuplicate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const exists = await this.lightNovelService.getLightNovelDuplicate(
        parseInt(req.params.id)
      );
      return res.json({ exists });
    } catch (error) {
      return next(error);
    }
  };

  createLightNovelBulk = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await this.lightNovelService.createLightNovelBulk(req.body.data);
      return res
        .status(201)
        .json({ message: "Light novel(s) created successfully!" });
    } catch (error) {
      return next(error);
    }
  };

  updateLightNovel = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await this.lightNovelService.updateLightNovel(
        parseInt(req.params.id),
        req.body
      );
      return res.json({ message: "Light novel updated successfully!" });
    } catch (error) {
      return next(error);
    }
  };

  updateLightNovelReview = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await this.lightNovelService.updateLightNovelReview(
        parseInt(req.params.id),
        req.body
      );
      return res.json({ message: "Light novel review updated successfully!" });
    } catch (error) {
      return next(error);
    }
  };

  updateLightNovelVolumeProgress = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await this.lightNovelService.updateLightNovelVolumeProgress(
        req.body.data
      );
      return res.json({ message: "Light novel volumes updated successfully!" });
    } catch (error) {
      return next(error);
    }
  };

  deleteLightNovel = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await this.lightNovelService.deleteLightNovel(parseInt(req.params.id));
      return res.status(204).end();
    } catch (error) {
      return next(error);
    }
  };

  deleteMultipleLightNovels = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await this.lightNovelService.deleteMultipleLightNovels(req.body.ids);
      return res.status(204).end();
    } catch (error) {
      return next(error);
    }
  };
}
