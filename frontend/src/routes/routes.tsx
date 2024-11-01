import { createBrowserRouter } from "react-router-dom";
import Home from "@/pages/general/Home.tsx";
import MediaList from "@/pages/admin/MediaList";
import AnimeList from "@/pages/general/anime/AnimeList";
import MangaList from "@/pages/general/manga/MangaList";
import LightNovelList from "@/pages/general/lightnovels/LightNovelList";
import GeneralAnimeDetail from "@/pages/general/anime/GeneralAnimeDetail";
import GeneralMangaDetail from "@/pages/general/manga/GeneralMangaDetail";
import GeneralLightNovelDetail from "@/pages/general/lightnovels/GeneralLightNovelDetail";
import AdminAnimeDetail from "@/pages/admin/AdminAnimeDetail";
import AdminMangaDetail from "@/pages/admin/AdminMangaDetail";
import AdminLightNovelDetail from "@/pages/admin/AdminLightNovelDetail";
import UnauthorizedPage from "@/routes/UnauthorizedPage";
import NotFoundPage from "@/routes/NotFoundPage";
import ProtectedRoute from "@/routes/ProtectedRoute";
import Dashboard from "@/pages/admin/Dashboard";

export const router = createBrowserRouter([
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
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    )
  },
  {
    path: "/admin/media-list",
    element: (
      <ProtectedRoute>
        <MediaList />
      </ProtectedRoute>
    )
  },
  {
    path: "/admin/anime/:animeId",
    element: (
      <ProtectedRoute>
        <AdminAnimeDetail />
      </ProtectedRoute>
    )
  },
  {
    path: "/admin/manga/:mangaId",
    element: (
      <ProtectedRoute>
        <AdminMangaDetail />
      </ProtectedRoute>
    )
  },
  {
    path: "/admin/lightnovel/:lightNovelId",
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
