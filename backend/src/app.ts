import express, { Express } from "express";
import cors from "cors";
import { json, urlencoded } from "body-parser";

const app: Express = express();

app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));

export default app;
