import { Router } from "express";
import { GenreService } from "../services/genre.service";
import { GenreController } from "../controllers/genre.controller";
import { authMiddleware } from "../middleware/auth.middleware";

class GenreRouter {
  public router: Router;
  private genreService: GenreService;
  private genreController: GenreController;

  constructor() {
    this.router = Router();
    this.genreService = new GenreService();
    this.genreController = new GenreController(this.genreService);
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/", this.genreController.getAllGenres);
    this.router.post("/", authMiddleware, this.genreController.createGenre);
    this.router.put("/:id", authMiddleware, this.genreController.updateGenre);
    this.router.delete(
      "/",
      authMiddleware,
      this.genreController.deleteMultipleGenres
    );
    this.router.delete(
      "/:id",
      authMiddleware,
      this.genreController.deleteGenre
    );
  }
}

export default new GenreRouter().router;
