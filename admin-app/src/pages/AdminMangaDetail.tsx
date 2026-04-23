import { useEffect } from "react";

import AdminLayout from "@/components/layout/AdminLayout";
import MangaHero from "@/components/manga-detail/MangaHero";
import MangaInfoSection from "@/components/manga-detail/MangaInfoSection";
import MangaReviewSection from "@/components/manga-detail/MangaReviewSection";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

import { useMangaDetail } from "@/hooks/useMangaDetail";
import { useToast } from "@/hooks/useToast";

import { AlertTriangleIcon, ArrowLeftIcon, Loader2Icon } from "lucide-react";
import { Link, useParams } from "react-router-dom";

export default function AdminMangaDetail() {
  const { mangaId } = useParams();
  const parsedId = mangaId ? parseInt(mangaId, 10) : undefined;
  const hasValidId = typeof parsedId === "number" && Number.isFinite(parsedId);

  const toast = useToast();
  const {
    data: mangaDetail,
    isLoading,
    isError,
    error
  } = useMangaDetail(hasValidId ? parsedId : undefined);

  useEffect(() => {
    if (mangaDetail) {
      document.title = `Manga - ${mangaDetail.title} | Otaku Corner Admin`;
    } else {
      document.title = "Manga | Otaku Corner Admin";
    }
  }, [mangaDetail]);

  useEffect(() => {
    if (isError && error instanceof Error) {
      toast.toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: error.message
      });
    }
  }, [error, isError, toast]);

  const backAction = (
    <Link to="/media">
      <Button variant="outline" size="sm" className="gap-2">
        <ArrowLeftIcon className="h-4 w-4" />
        <span className="hidden sm:inline">Back to library</span>
      </Button>
    </Link>
  );

  if (isLoading || (!mangaDetail && !isError)) {
    return (
      <AdminLayout
        title="Loading manga..."
        description="Fetching details from the library"
        actions={backAction}
      >
        <MangaDetailSkeleton />
      </AdminLayout>
    );
  }

  if (isError || !mangaDetail) {
    return (
      <AdminLayout
        title="Manga not found"
        description="We couldn't load this manga entry"
        actions={backAction}
      >
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border/40 bg-background/35 p-10 text-center shadow-sm backdrop-blur-sm">
          <AlertTriangleIcon className="h-8 w-8 text-rose-400" />
          <p className="text-sm text-muted-foreground">
            {error instanceof Error
              ? error.message
              : "Unknown error while loading the manga."}
          </p>
          <Link to="/media">
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
      title={mangaDetail.title}
      description={mangaDetail.titleJapanese || "Manga entry"}
      hideHeader
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="md:hidden" />
          <Link to="/media">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Back to library</span>
            </Button>
          </Link>
        </div>
        <MangaHero mangaDetail={mangaDetail} />
        <MangaInfoSection mangaDetail={mangaDetail} />
        <MangaReviewSection key={mangaDetail.id} mangaDetail={mangaDetail} />
      </div>
    </AdminLayout>
  );
}

function MangaDetailSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-border/40 bg-background/35 p-6 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col gap-6 xl:flex-row">
          <Skeleton className="h-[340px] w-[240px] rounded-xl xl:h-[400px] xl:w-[280px]" />
          <div className="flex flex-1 flex-col gap-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              <Skeleton className="h-14 rounded-lg" />
              <Skeleton className="h-14 rounded-lg" />
              <Skeleton className="h-14 rounded-lg" />
              <Skeleton className="h-14 rounded-lg" />
            </div>
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-2xl border border-border/40 bg-background/35 p-6 shadow-sm backdrop-blur-sm">
        <Loader2Icon className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">
          Loading manga details...
        </span>
      </div>
    </div>
  );
}
