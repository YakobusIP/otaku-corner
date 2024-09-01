import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/general/Home.tsx";
import Dashboard from "@/pages/admin/Dashboard";
import axios from "axios";
import AdminAnimeDetail from "@/pages/admin/AdminAnimeDetail";
import AnimeList from "@/pages/general/anime/AnimeList";
import GeneralAnimeDetail from "@/pages/general/anime/GeneralAnimeDetail";

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
    path: "/anime/:animeId",
    element: <GeneralAnimeDetail />
  },
  {
    path: "/admin",
    element: <Dashboard />
  },
  {
    path: "/admin/anime/:animeId",
    element: <AdminAnimeDetail />
  }
]);

axios.defaults.baseURL = import.meta.env.VITE_AXIOS_BASE_URL;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
    <Toaster />
  </React.StrictMode>
);
