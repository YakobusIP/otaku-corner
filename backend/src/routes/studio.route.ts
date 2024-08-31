import { Router } from "express";
import { StudioService } from "../services/studio.service";
import { StudioController } from "../controllers/studio.controller";

class StudioRouter {
  public router: Router;
  private studioService: StudioService;
  private studioController: StudioController;

  constructor() {
    this.router = Router();
    this.studioService = new StudioService();
    this.studioController = new StudioController(this.studioService);
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/", this.studioController.getAllStudios);
  }
}

export default new StudioRouter().router;
