import AdminAnimeDetail from "@/pages/AdminAnimeDetail";
import AdminLightNovelDetail from "@/pages/AdminLightNovelDetail";
import AdminMangaDetail from "@/pages/AdminMangaDetail";
import Dashboard from "@/pages/Dashboard";
import Home from "@/pages/Home.tsx";
import MediaList from "@/pages/MediaList";
import NotFoundPage from "@/routes/NotFoundPage";
import ProtectedRoute from "@/routes/ProtectedRoute";
import UnauthorizedPage from "@/routes/UnauthorizedPage";
import { createBrowserRouter } from "react-router-dom";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />
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
        <MediaList />
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
    path: "/lightnovel/:lightNovelId/:slug",
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
