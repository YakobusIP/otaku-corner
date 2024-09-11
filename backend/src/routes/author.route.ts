import { Router } from "express";
import { AuthorService } from "../services/author.service";
import { AuthorController } from "../controllers/author.controller";

class AuthorRouter {
  public router: Router;
  private authorService: AuthorService;
  private authorController: AuthorController;

  constructor() {
    this.router = Router();
    this.authorService = new AuthorService();
    this.authorController = new AuthorController(this.authorService);
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/", this.authorController.getAllAuthors);
  }
}

export default new AuthorRouter().router;
