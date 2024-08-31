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
  }
}

export default new GenreRouter().router;
