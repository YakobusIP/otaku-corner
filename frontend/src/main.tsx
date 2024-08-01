import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/general/Home.tsx";
import Dashboard from "@/pages/admin/Dashboard";
import axios from "axios";
import AnimeDetail from "./pages/admin/AnimeDetail";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />
  },
  {
    path: "/admin",
    element: <Dashboard />
  },
  {
    path: "/admin/anime/:animeId",
    element: <AnimeDetail />
  }
]);

axios.defaults.baseURL = import.meta.env.VITE_AXIOS_BASE_URL;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
    <Toaster />
  </React.StrictMode>
);
