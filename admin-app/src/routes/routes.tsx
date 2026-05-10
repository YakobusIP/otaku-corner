import { RequireAuth } from "@/auth/RequireAuth";

import AdminAnimeDetail from "@/pages/AdminAnimeDetail";
import AdminLightNovelDetail from "@/pages/AdminLightNovelDetail";
import AdminMangaDetail from "@/pages/AdminMangaDetail";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import MediaLibrary from "@/pages/MediaLibrary";
import NotFoundPage from "@/routes/NotFoundPage";
import UnauthorizedPage from "@/routes/UnauthorizedPage";
import { createBrowserRouter } from "react-router-dom";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />
  },
  {
    element: <RequireAuth />,
    children: [
      {
        path: "dashboard",
        element: <Dashboard />
      },
      {
        path: "media-list",
        element: <MediaLibrary />
      },
      {
        path: "anime/:animeId/:slug",
        element: <AdminAnimeDetail />
      },
      {
        path: "manga/:mangaId/:slug",
        element: <AdminMangaDetail />
      },
      {
        path: "light-novel/:lightNovelId/:slug",
        element: <AdminLightNovelDetail />
      }
    ]
  },
  {
    path: "/unauthorized",
    element: <UnauthorizedPage />
  },
  {
    path: "/404",
    element: <NotFoundPage />
  },
  {
    path: "*",
    element: <NotFoundPage />
  }
]);
