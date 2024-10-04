import { Router } from "express";
import { AuthorService } from "../services/author.service";
import { AuthorController } from "../controllers/author.controller";
import { authMiddleware } from "../middleware/auth.middleware";

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
    this.router.post("/", authMiddleware, this.authorController.createAuthor);
    this.router.put("/:id", authMiddleware, this.authorController.updateAuthor);
    this.router.delete(
      "/",
      authMiddleware,
      this.authorController.deleteMultipleAuthors
    );
    this.router.delete(
      "/:id",
      authMiddleware,
      this.authorController.deleteAuthor
    );
  }
}

export default new AuthorRouter().router;
