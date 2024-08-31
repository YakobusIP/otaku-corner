import { Router } from "express";
import { ThemeService } from "../services/theme.service";
import { ThemeController } from "../controllers/theme.controller";

class ThemeRouter {
  public router: Router;
  private themeService: ThemeService;
  private themeController: ThemeController;

  constructor() {
    this.router = Router();
    this.themeService = new ThemeService();
    this.themeController = new ThemeController(this.themeService);
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/", this.themeController.getAllThemes);
  }
}

export default new ThemeRouter().router;
