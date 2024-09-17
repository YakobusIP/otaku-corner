import { Router } from "express";
import { LightNovelService } from "../services/lightnovel.service";
import { LightNovelController } from "../controllers/lightnovel.controller";
import { AuthorService } from "../services/author.service";
import { GenreService } from "../services/genre.service";
import { ThemeService } from "../services/theme.service";

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
    this.router.get("/:id", this.lightNovelController.getLightNovelById);
    this.router.post("/", this.lightNovelController.createLightNovel);
    this.router.put("/:id", this.lightNovelController.updateLightNovel);
    this.router.put(
      "/review/:id",
      this.lightNovelController.updateLightNovelReview
    );
    this.router.delete(
      "/",
      this.lightNovelController.deleteMultipleLightNovels
    );
    this.router.delete("/:id", this.lightNovelController.deleteLightNovel);
  }
}

export default new LightNovelRouter().router;
