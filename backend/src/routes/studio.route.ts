import { Router } from "express";
import { StudioService } from "../services/studio.service";
import { StudioController } from "../controllers/studio.controller";
import { authMiddleware } from "../middleware/auth.middleware";

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
    this.router.post("/", authMiddleware, this.studioController.createStudio);
    this.router.put("/:id", authMiddleware, this.studioController.updateStudio);
    this.router.delete(
      "/",
      authMiddleware,
      this.studioController.deleteMultipleStudios
    );
    this.router.delete(
      "/:id",
      authMiddleware,
      this.studioController.deleteStudio
    );
  }
}

export default new StudioRouter().router;
