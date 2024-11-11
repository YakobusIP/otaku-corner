import { Router } from "express";
import { StatisticService } from "../services/statistic.service";
import { StatisticController } from "../controllers/statistic.controller";
import { authMiddleware } from "../middleware/auth.middleware";

class StatisticRouter {
  public router: Router;
  private statisticService: StatisticService;
  private statisticController: StatisticController;

  constructor() {
    this.router = Router();
    this.statisticService = new StatisticService();
    this.statisticController = new StatisticController(this.statisticService);
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      "/year-range",
      authMiddleware,
      this.statisticController.getYearRange
    );
    this.router.get(
      "/media-consumption",
      authMiddleware,
      this.statisticController.getMediaConsumption
    );
    this.router.get(
      "/media-progress",
      authMiddleware,
      this.statisticController.getMediaProgress
    );
    this.router.get(
      "/genre-consumption",
      authMiddleware,
      this.statisticController.getGenreConsumption
    );
    this.router.get(
      "/studio-consumption",
      authMiddleware,
      this.statisticController.getStudioConsumption
    );
    this.router.get(
      "/theme-consumption",
      authMiddleware,
      this.statisticController.getThemeConsumption
    );
    this.router.get(
      "/author-consumption",
      authMiddleware,
      this.statisticController.getAuthorConsumption
    );
    this.router.get(
      "/all-time",
      authMiddleware,
      this.statisticController.getAllTimeStatistics
    );
    this.router.get(
      "/top-media-and-yearly-count",
      this.statisticController.getEachMediaTopScoreAndYearlyCount
    );
  }
}

export default new StatisticRouter().router;
