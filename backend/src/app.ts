import express, { Express, NextFunction, Request, Response } from "express";
import cors from "cors";
import { json, urlencoded } from "body-parser";

import AnimeRouter from "./routes/anime.route";
import GenreRouter from "./routes/genre.route";
import StudioRouter from "./routes/studio.route";
import ThemeRouter from "./routes/theme.route";

const app: Express = express();

app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));

app.use("/api/anime", AnimeRouter);
app.use("/api/genre", GenreRouter);
app.use("/api/studio", StudioRouter);
app.use("/api/theme", ThemeRouter);

export default app;
