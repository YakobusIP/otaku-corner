import { Suspense, lazy } from "react";

import { RequireAuth } from "@/auth";
import NotFoundPage from "@/routes/NotFoundPage";
import UnauthorizedPage from "@/routes/UnauthorizedPage";
import type { Router } from "@remix-run/router";
import { createBrowserRouter } from "react-router-dom";

const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Login = lazy(() => import("@/pages/Login"));
const MediaLibrary = lazy(() => import("@/pages/MediaLibrary"));
const AdminAnimeDetail = lazy(() => import("@/pages/AdminAnimeDetail"));
const AdminMangaDetail = lazy(() => import("@/pages/AdminMangaDetail"));
const AdminLightNovelDetail = lazy(
  () => import("@/pages/AdminLightNovelDetail")
);
const ImageVault = lazy(() => import("@/pages/ImageVault"));

function PageLoader() {
  return null;
}

export const router: Router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={<PageLoader />}>
        <Login />
      </Suspense>
    )
  },
  {
    element: <RequireAuth />,
    children: [
      {
        path: "dashboard",
        element: (
          <Suspense fallback={<PageLoader />}>
            <Dashboard />
          </Suspense>
        )
      },
      {
        path: "media-list",
        element: (
          <Suspense fallback={<PageLoader />}>
            <MediaLibrary />
          </Suspense>
        )
      },
      {
        path: "image-vault",
        element: (
          <Suspense fallback={<PageLoader />}>
            <ImageVault />
          </Suspense>
        )
      },
      {
        path: "anime/:animeId/:slug",
        element: (
          <Suspense fallback={<PageLoader />}>
            <AdminAnimeDetail />
          </Suspense>
        )
      },
      {
        path: "manga/:mangaId/:slug",
        element: (
          <Suspense fallback={<PageLoader />}>
            <AdminMangaDetail />
          </Suspense>
        )
      },
      {
        path: "light-novel/:lightNovelId/:slug",
        element: (
          <Suspense fallback={<PageLoader />}>
            <AdminLightNovelDetail />
          </Suspense>
        )
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