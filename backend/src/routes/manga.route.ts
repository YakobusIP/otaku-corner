import { Router } from "express";
import { MangaService } from "../services/manga.service";
import { MangaController } from "../controllers/manga.controller";
import { AuthorService } from "../services/author.service";
import { GenreService } from "../services/genre.service";
import { ThemeService } from "../services/theme.service";

class MangaRouter {
  public router: Router;
  private mangaService: MangaService;
  private mangaController: MangaController;

  constructor() {
    this.router = Router();
    this.mangaService = new MangaService(
      new AuthorService(),
      new GenreService(),
      new ThemeService()
    );
    this.mangaController = new MangaController(this.mangaService);
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/", this.mangaController.getAllMangas);
    this.router.get("/:id", this.mangaController.getMangaById);
    this.router.post("/", this.mangaController.createManga);
    this.router.put("/:id", this.mangaController.updateManga);
    this.router.put("/review/:id", this.mangaController.updateMangaReview);
    this.router.delete("/", this.mangaController.deleteMultipleManga);
    this.router.delete("/:id", this.mangaController.deleteManga);
  }
}

export default new MangaRouter().router;
