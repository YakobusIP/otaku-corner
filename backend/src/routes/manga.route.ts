import { Router } from "express";
import { MangaService } from "../services/manga.service";
import { MangaController } from "../controllers/manga.controller";
import { AuthorService } from "../services/author.service";
import { GenreService } from "../services/genre.service";
import { ThemeService } from "../services/theme.service";
import { authMiddleware } from "../middleware/auth.middleware";

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
    this.router.get("/total", this.mangaController.getTotalData);
    this.router.get("/sitemap", this.mangaController.getSitemapData);
    this.router.get("/duplicate/:id", this.mangaController.getMangaDuplicate);
    this.router.get("/:id", this.mangaController.getMangaById);
    this.router.post("/", authMiddleware, this.mangaController.createMangaBulk);
    this.router.put("/:id", authMiddleware, this.mangaController.updateManga);
    this.router.put(
      "/:id/review",
      authMiddleware,
      this.mangaController.updateMangaReview
    );
    this.router.delete(
      "/",
      authMiddleware,
      this.mangaController.deleteMultipleMangas
    );
    this.router.delete(
      "/:id",
      authMiddleware,
      this.mangaController.deleteManga
    );
  }
}

export default new MangaRouter().router;
