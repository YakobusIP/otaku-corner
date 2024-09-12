import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/general/Home.tsx";
import Dashboard from "@/pages/admin/Dashboard";
import axios from "axios";
import AnimeList from "@/pages/general/anime/AnimeList";
import MangaList from "@/pages/general/manga/MangaList";
import LightNovelList from "@/pages/general/lightnovels/LightNovelList";
import GeneralAnimeDetail from "@/pages/general/anime/GeneralAnimeDetail";
import GeneralMangaDetail from "@/pages/general/manga/GeneralMangaDetail";
import GeneralLightNovelDetail from "@/pages/general/lightnovels/GeneralLightNovelDetail";
import AdminAnimeDetail from "@/pages/admin/AdminAnimeDetail";
import AdminMangaDetail from "@/pages/admin/AdminMangaDetail";
import AdminLightNovelDetail from "@/pages/admin/AdminLightNovelDetail";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />
  },
  {
    path: "/anime",
    element: <AnimeList />
  },
  {
    path: "/manga",
    element: <MangaList />
  },
  {
    path: "/lightnovel",
    element: <LightNovelList />
  },
  {
    path: "/anime/:animeId",
    element: <GeneralAnimeDetail />
  },
  {
    path: "/manga/:mangaId",
    element: <GeneralMangaDetail />
  },
  {
    path: "/lightnovel/:lightNovelId",
    element: <GeneralLightNovelDetail />
  },
  {
    path: "/admin",
    element: <Dashboard />
  },
  {
    path: "/admin/anime/:animeId",
    element: <AdminAnimeDetail />
  },
  {
    path: "/admin/manga/:mangaId",
    element: <AdminMangaDetail />
  },
  {
    path: "/admin/lightnovel/:lightNovelId",
    element: <AdminLightNovelDetail />
  }
]);

axios.defaults.baseURL = import.meta.env.VITE_AXIOS_BASE_URL;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
    <Toaster />
  </React.StrictMode>
);
