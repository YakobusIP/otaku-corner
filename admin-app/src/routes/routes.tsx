import AdminAnimeDetail from "@/pages/AdminAnimeDetail";
import AdminLightNovelDetail from "@/pages/AdminLightNovelDetail";
import AdminMangaDetail from "@/pages/AdminMangaDetail";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import MediaLibrary from "@/pages/MediaLibrary";
import NotFoundPage from "@/routes/NotFoundPage";
import ProtectedRoute from "@/routes/ProtectedRoute";
import UnauthorizedPage from "@/routes/UnauthorizedPage";
import { createBrowserRouter } from "react-router-dom";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    )
  },
  {
    path: "/media-list",
    element: (
      <ProtectedRoute>
        <MediaLibrary />
      </ProtectedRoute>
    )
  },
  {
    path: "/anime/:animeId/:slug",
    element: (
      <ProtectedRoute>
        <AdminAnimeDetail />
      </ProtectedRoute>
    )
  },
  {
    path: "/manga/:mangaId/:slug",
    element: (
      <ProtectedRoute>
        <AdminMangaDetail />
      </ProtectedRoute>
    )
  },
  {
    path: "/light-novel/:lightNovelId/:slug",
    element: (
      <ProtectedRoute>
        <AdminLightNovelDetail />
      </ProtectedRoute>
    )
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
