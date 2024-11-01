import { Router } from "express";
import { StatisticService } from "../services/statistic.service";
import { StatisticController } from "../controllers/statistic.controller";

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
    this.router.get("/year-range", this.statisticController.getYearRange);
    this.router.get(
      "/media-consumption",
      this.statisticController.getMediaConsumption
    );
    this.router.get(
      "/media-progress",
      this.statisticController.getMediaProgress
    );
    this.router.get(
      "/genre-consumption",
      this.statisticController.getGenreConsumption
    );
    this.router.get(
      "/studio-consumption",
      this.statisticController.getStudioConsumption
    );
    this.router.get(
      "/theme-consumption",
      this.statisticController.getThemeConsumption
    );
    this.router.get(
      "/author-consumption",
      this.statisticController.getAuthorConsumption
    );
    this.router.get("/all-time", this.statisticController.getAllTimeStatistics);
  }
}

export default new StatisticRouter().router;
