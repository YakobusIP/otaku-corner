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
import GeneralAnimeDetail from "@/pages/general/anime/GeneralAnimeDetail";
import GeneralMangaDetail from "@/pages/general/manga/GeneralMangaDetail";
import AdminAnimeDetail from "@/pages/admin/AdminAnimeDetail";
import AdminMangaDetail from "@/pages/admin/AdminMangaDetail";

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
    path: "/anime/:animeId",
    element: <GeneralAnimeDetail />
  },
  {
    path: "/manga/:mangaId",
    element: <GeneralMangaDetail />
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
  }
]);

axios.defaults.baseURL = import.meta.env.VITE_AXIOS_BASE_URL;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
    <Toaster />
  </React.StrictMode>
);
