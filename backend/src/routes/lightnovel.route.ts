import { Router } from "express";
import { LightNovelService } from "../services/lightnovel.service";
import { LightNovelController } from "../controllers/lightnovel.controller";
import { AuthorService } from "../services/author.service";
import { GenreService } from "../services/genre.service";
import { ThemeService } from "../services/theme.service";
import { authMiddleware } from "../middleware/auth.middleware";

class LightNovelRouter {
  public router: Router;
  private lightNovelService: LightNovelService;
  private lightNovelController: LightNovelController;

  constructor() {
    this.router = Router();
    this.lightNovelService = new LightNovelService(
      new AuthorService(),
      new GenreService(),
      new ThemeService()
    );
    this.lightNovelController = new LightNovelController(
      this.lightNovelService
    );
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/", this.lightNovelController.getAllLightNovels);
    this.router.get("/total", this.lightNovelController.getTotalData);
    this.router.get("/sitemap", this.lightNovelController.getSitemapData);
    this.router.get(
      "/duplicate/:id",
      this.lightNovelController.getLightNovelDuplicate
    );
    this.router.get("/:id", this.lightNovelController.getLightNovelById);
    this.router.post(
      "/",
      authMiddleware,
      this.lightNovelController.createLightNovelBulk
    );
    this.router.put(
      "/volume-progress",
      authMiddleware,
      this.lightNovelController.updateLightNovelVolumeProgress
    );
    this.router.put(
      "/:id",
      authMiddleware,
      this.lightNovelController.updateLightNovel
    );
    this.router.put(
      "/:id/review",
      authMiddleware,
      this.lightNovelController.updateLightNovelReview
    );
    this.router.delete(
      "/",
      authMiddleware,
      this.lightNovelController.deleteMultipleLightNovels
    );
    this.router.delete(
      "/:id",
      authMiddleware,
      this.lightNovelController.deleteLightNovel
    );
  }
}

export default new LightNovelRouter().router;
