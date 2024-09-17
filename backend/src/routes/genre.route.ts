import { Router } from "express";
import { GenreService } from "../services/genre.service";
import { GenreController } from "../controllers/genre.controller";

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
    this.router.post("/", this.genreController.createGenre);
    this.router.put("/:id", this.genreController.updateGenre);
    this.router.delete("/", this.genreController.deleteMultipleGenres);
    this.router.delete("/:id", this.genreController.deleteGenre);
  }
}

export default new GenreRouter().router;
