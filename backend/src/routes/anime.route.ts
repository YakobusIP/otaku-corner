import { Router } from "express";
import { AnimeService } from "../services/anime.service";
import { AnimeController } from "../controllers/anime.controller";
import { GenreService } from "../services/genre.service";
import { StudioService } from "../services/studio.service";
import { ThemeService } from "../services/theme.service";

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
    this.router.post("/", this.animeController.createAnime);
    this.router.put("/:id", this.animeController.updateAnime);
    this.router.put("/review/:id", this.animeController.updateAnimeReview);
    this.router.delete("/", this.animeController.deleteMultipleAnime);
    this.router.delete("/:id", this.animeController.deleteAnime);
  }
}

export default new AnimeRouter().router;
