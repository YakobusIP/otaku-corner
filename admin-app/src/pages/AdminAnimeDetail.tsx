import { useEffect } from "react";

import AnimeEpisodesSection from "@/components/anime-detail/AnimeEpisodesSection";
import AnimeHero from "@/components/anime-detail/AnimeHero";
import AnimeInfoSection from "@/components/anime-detail/AnimeInfoSection";
import AnimeReviewSection from "@/components/anime-detail/AnimeReviewSection";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

import { useAnimeDetail } from "@/hooks/useAnimeDetail";

import { AlertTriangleIcon, ArrowLeftIcon, Loader2Icon } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";

export default function AdminAnimeDetail() {
  const { animeId } = useParams();
  const parsedId = animeId ? parseInt(animeId, 10) : undefined;
  const hasValidId = typeof parsedId === "number" && Number.isFinite(parsedId);

  const {
    data: animeDetail,
    isLoading,
    isError,
    error
  } = useAnimeDetail(hasValidId ? parsedId : undefined);

  useEffect(() => {
    if (animeDetail) {
      document.title = `Anime - ${animeDetail.title} | Otaku Corner Admin`;
    } else {
      document.title = "Anime | Otaku Corner Admin";
    }
  }, [animeDetail]);

  useEffect(() => {
    if (isError && error instanceof Error) {
      toast.error("Uh oh! Something went wrong", {
        description: error.message
      });
    }
  }, [error, isError]);

  const backAction = (
    <Link to="/media-list">
      <Button variant="outline" size="sm" className="gap-2">
        <ArrowLeftIcon className="h-4 w-4" />
        <span className="hidden sm:inline">Back to library</span>
      </Button>
    </Link>
  );

  if (isLoading || (!animeDetail && !isError)) {
    return (
      <AdminLayout
        title="Loading anime..."
        description="Fetching details from the library"
        actions={backAction}
      >
        <AnimeDetailSkeleton />
      </AdminLayout>
    );
  }

  if (isError || !animeDetail) {
    return (
      <AdminLayout
        title="Anime not found"
        description="We couldn't load this anime entry"
        actions={backAction}
      >
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border/40 bg-background/35 p-10 text-center shadow-xs backdrop-blur-xs">
          <AlertTriangleIcon className="h-8 w-8 text-rose-400" />
          <p className="text-sm text-muted-foreground">
            {error instanceof Error
              ? error.message
              : "Unknown error while loading the anime."}
          </p>
          <Link to="/media-list">
            <Button variant="default" size="sm" className="gap-2">
              <ArrowLeftIcon className="h-4 w-4" />
              Return to media library
            </Button>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={animeDetail.title}
      description={animeDetail.titleJapanese || "Anime entry"}
      hideHeader
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="@tablet:hidden" />
          <Link to="/media-list">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Back to library</span>
            </Button>
          </Link>
        </div>
        <AnimeHero animeDetail={animeDetail} />
        <AnimeInfoSection animeDetail={animeDetail} />
        {animeDetail.type !== "Movie" ? (
          <AnimeEpisodesSection animeDetail={animeDetail} />
        ) : null}
        <AnimeReviewSection key={animeDetail.id} animeDetail={animeDetail} />
      </div>
    </AdminLayout>
  );
}

function AnimeDetailSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-border/40 bg-background/35 p-6 shadow-xs backdrop-blur-xs">
        <div className="flex flex-col gap-6 @7xl:flex-row">
          <Skeleton className="h-[340px] w-[240px] rounded-xl @7xl:h-[400px] @7xl:w-[280px]" />
          <div className="flex flex-1 flex-col gap-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
            <div className="grid grid-cols-2 gap-2 @tablet:grid-cols-4 @desktop:grid-cols-4">
              <Skeleton className="h-14 rounded-lg" />
              <Skeleton className="h-14 rounded-lg" />
              <Skeleton className="h-14 rounded-lg" />
              <Skeleton className="h-14 rounded-lg" />
            </div>
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-2xl border border-border/40 bg-background/35 p-6 shadow-xs backdrop-blur-xs">
        <Loader2Icon className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">
          Loading anime details...
        </span>
      </div>
    </div>
  );
}
