import { useCallback, useEffect, useRef, useState } from "react";

import { fetchMangaByIdService } from "@/services/manga.service";

import AboutTab from "@/components/manga-detail/AboutTab";
import ReviewTab from "@/components/manga-detail/ReviewTab";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useToast } from "@/hooks/useToast";

import { type MangaDetail } from "@/types/manga.type";

import { ArrowLeftIcon, Loader2Icon } from "lucide-react";
import { Link, useParams } from "react-router-dom";

export default function AdminMangaDetail() {
  const [mangaDetail, setMangaDetail] = useState<MangaDetail>();
  const [isLoadingMangaDetail, setIsLoadingMangaDetail] = useState(false);
  const { mangaId } = useParams();

  const toast = useToast();
  const toastRef = useRef(toast.toast);

  const fetchMangaById = useCallback(async () => {
    setIsLoadingMangaDetail(true);
    const response = await fetchMangaByIdService(parseInt(mangaId as string));
    if (response.success) {
      setMangaDetail(response.data);
    } else {
      toastRef.current({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: response.error
      });
    }
    setIsLoadingMangaDetail(false);
  }, [mangaId]);

  useEffect(() => {
    fetchMangaById();
  }, [fetchMangaById]);

  useEffect(() => {
    if (mangaDetail) {
      document.title = `Manga - ${mangaDetail.title} | Otaku Corner Admin`;
    } else {
      document.title = "Manga | Otaku Corner Admin";
    }
  }, [mangaDetail]);

  return !isLoadingMangaDetail && mangaDetail ? (
    <div className="flex flex-col min-h-[100dvh]">
      <Link to="/media-list">
        <Button variant="outline" className="absolute top-4 left-4">
          <ArrowLeftIcon className="w-4 h-4" /> Back to list
        </Button>
      </Link>
      <header className="w-full bg-gradient-to-b xl:bg-gradient-to-r from-primary to-muted-foreground pt-20 pb-12 xl:py-12 px-4">
        <div className="container mx-auto flex flex-col xl:flex-row gap-6 items-center">
          <img
            src={
              mangaDetail.images.large_image_url ?? mangaDetail.images.image_url
            }
            width={300}
            height={400}
            alt="Manga Cover"
            className="rounded-xl"
          />
          <div className="flex flex-col gap-4">
            <h1 className="text-white">{mangaDetail.title}</h1>
            <p className="text-lg text-white/80 whitespace-pre-line">
              {mangaDetail.synopsis}
            </p>
          </div>
        </div>
      </header>
      <main className="container mx-auto py-8 xl:py-12 px-8 xl:px-6">
        <Tabs defaultValue="about">
          <TabsList>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <AboutTab mangaDetail={mangaDetail} resetParent={fetchMangaById} />
          <ReviewTab mangaDetail={mangaDetail} resetParent={fetchMangaById} />
        </Tabs>
      </main>
    </div>
  ) : (
    <div className="flex flex-col min-h-[100dvh] items-center justify-center gap-4">
      <img src="/loading.gif" className="w-32 h-32 rounded-xl" />
      <div className="flex items-center justify-center gap-2 xl:gap-4">
        <Loader2Icon className="w-8 h-8 xl:w-16 xl:h-16 animate-spin" />
        <h2>Fetching manga details...</h2>
      </div>
    </div>
  );
}
