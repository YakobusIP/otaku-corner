import express, { Express } from "express";
import morgan from "morgan";
import cors from "cors";
import cookies from "cookie-parser";
import { json, urlencoded } from "body-parser";

import AuthRouter from "./routes/auth.route";
import AnimeRouter from "./routes/anime.route";
import MangaRouter from "./routes/manga.route";
import LightNovelRouter from "./routes/lightnovel.route";
import GenreRouter from "./routes/genre.route";
import StudioRouter from "./routes/studio.route";
import ThemeRouter from "./routes/theme.route";
import AuthorRouter from "./routes/author.route";
import StatisticRouter from "./routes/statistic.route";
import UploadRouter from "./routes/upload.route";
import path from "path";
import { env } from "./lib/env";
import { requestLogMiddleware } from "./middleware/requestlog.middleware";
import { errorMiddleware } from "./middleware/error.middleware";
import { throttleMiddleware } from "./middleware/throttle.middleware";

const app: Express = express();

if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3000", "http://localhost:5173"]
  })
);
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cookies());

app.use(requestLogMiddleware);

app.use(
  "/uploads",
  express.static(path.join(__dirname, env.RELATIVE_LOCAL_UPLOAD_PATH))
);

app.use("/api/auth", AuthRouter);
app.use(throttleMiddleware);
app.use("/api/anime", AnimeRouter);
app.use("/api/manga", MangaRouter);
app.use("/api/lightnovel", LightNovelRouter);
app.use("/api/genre", GenreRouter);
app.use("/api/studio", StudioRouter);
app.use("/api/theme", ThemeRouter);
app.use("/api/author", AuthorRouter);
app.use("/api/statistic", StatisticRouter);
app.use("/api/upload", UploadRouter);

app.use(errorMiddleware);

export default app;
