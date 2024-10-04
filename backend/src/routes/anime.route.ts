import { Router } from "express";
import { AnimeService } from "../services/anime.service";
import { AnimeController } from "../controllers/anime.controller";
import { GenreService } from "../services/genre.service";
import { StudioService } from "../services/studio.service";
import { ThemeService } from "../services/theme.service";
import { authMiddleware } from "../middleware/auth.middleware";

class AnimeRouter {
  public router: Router;
  private animeService: AnimeService;
  private animeController: AnimeController;

  constructor() {
    this.router = Router();
    this.animeService = new AnimeService(
      new GenreService(),
      new StudioService(),
      new ThemeService()
    );
    this.animeController = new AnimeController(this.animeService);
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/", this.animeController.getAllAnimes);
    this.router.get("/:id", this.animeController.getAnimeById);
    this.router.post("/", authMiddleware, this.animeController.createAnime);
    this.router.put("/:id", authMiddleware, this.animeController.updateAnime);
    this.router.put(
      "/review/:id",
      authMiddleware,
      this.animeController.updateAnimeReview
    );
    this.router.delete(
      "/",
      authMiddleware,
      this.animeController.deleteMultipleAnimes
    );
    this.router.delete(
      "/:id",
      authMiddleware,
      this.animeController.deleteAnime
    );
  }
}

export default new AnimeRouter().router;
