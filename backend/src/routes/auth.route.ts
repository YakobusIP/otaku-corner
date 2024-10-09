import { Router } from "express";
import { AuthService } from "../services/auth.service";
import { AuthController } from "../controllers/auth.controller";

class AuthRouter {
  public router: Router;
  private authService: AuthService;
  private authController: AuthController;

  constructor() {
    this.router = Router();
    this.authService = new AuthService();
    this.authController = new AuthController(this.authService);
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("/login", this.authController.login);
    this.router.post("/logout", this.authController.logout);
    this.router.get("/validate-token", this.authController.validateToken);
    this.router.get("/refresh-token", this.authController.refreshToken);
  }
}

export default new AuthRouter().router;
