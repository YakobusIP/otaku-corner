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
      const page = req.query.page as string;
      const limit = req.query.limit as string;

      if (!page || !limit) {
        throw new UnprocessableEntityError("Pagination query params missing!");
      }

      const query = req.query.q as string;
      const sort = req.query.sort as string;
      const order = req.query.order as Prisma.SortOrder;
      const author = parseInt(req.query.author as string);
      const genre = parseInt(req.query.genre as string);
      const theme = parseInt(req.query.theme as string);
      const status = req.query.status as ProgressStatus;
      const mal_score = req.query.mal_score as string;
      const personal_score = req.query.personal_score as string;
      const status_check = req.query.status_check as string;
      const lightNovels = await this.lightNovelService.getAllLightNovels(
        parseInt(page),
        parseInt(limit),
        query,
        sort,
        order,
        author,
        genre,
        theme,
        status,
        mal_score,
        personal_score,
        status_check
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

  getTotalData = async (_: Request, res: Response, next: NextFunction) => {
    try {
      const count = await this.lightNovelService.getTotalData();
      return res.json({ count });
    } catch (error) {
      return next(error);
    }
  };

  getSitemapData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = req.query.page as string;
      const limit = req.query.limit as string;

      if (!page || !limit) {
        throw new UnprocessableEntityError("Pagination query params missing!");
      }

      const lightNovel = await this.lightNovelService.getSitemapData(
        parseInt(page),
        parseInt(limit)
      );
      return res.json({ data: lightNovel });
    } catch (error) {
      return next(error);
    }
  };

  getLightNovelStatusCounts = async (
    _: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const statusCounts =
        await this.lightNovelService.getLightNovelStatusCounts();
      return res.json({ data: statusCounts });
    } catch (error) {
      return next(error);
    }
  };
}
