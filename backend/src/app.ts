import express, { Express } from "express";
import cors from "cors";
import { json, urlencoded } from "body-parser";

import AnimeRouter from "./routes/anime.route";
import MangaRouter from "./routes/manga.route";
import LightNovelRouter from "./routes/lightnovel.route";
import GenreRouter from "./routes/genre.route";
import StudioRouter from "./routes/studio.route";
import ThemeRouter from "./routes/theme.route";
import AuthorRouter from "./routes/author.route";

const app: Express = express();

app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));

app.use("/api/anime", AnimeRouter);
app.use("/api/manga", MangaRouter);
app.use("/api/lightnovel", LightNovelRouter);
app.use("/api/genre", GenreRouter);
app.use("/api/studio", StudioRouter);
app.use("/api/theme", ThemeRouter);
app.use("/api/author", AuthorRouter);

export default app;
