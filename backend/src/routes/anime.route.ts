import { Router } from "express";
import { AnimeService } from "../services/anime.service";
import { AnimeController } from "../controllers/anime.controller";
import { GenreService } from "../services/genre.service";
import { StudioService } from "../services/studio.service";
import { ThemeService } from "../services/theme.service";

const router = Router();

const animeService = new AnimeService(
  new GenreService(),
  new StudioService(),
  new ThemeService()
);
const animeController = new AnimeController(animeService);

router.get("/", animeController.getAllAnimes);
router.get("/:id", animeController.getAnimeById);
router.post("/", animeController.createAnime);
router.put("/:id", animeController.updateAnime);
router.put("/review/:id", animeController.updateAnimeReview);
router.delete("/", animeController.deleteMultipleAnime);
router.delete("/:id", animeController.deleteAnime);

export default router;
