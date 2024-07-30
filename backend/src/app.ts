import express, { Express } from "express";
import cors from "cors";
import { json, urlencoded } from "body-parser";

import animeRoutes from "./routes/anime.route";

const app: Express = express();

app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));

app.use("/api/anime", animeRoutes);

export default app;
