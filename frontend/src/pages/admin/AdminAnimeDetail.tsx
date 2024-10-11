import { useToast } from "@/components/ui/use-toast";
import { fetchAnimeByIdService } from "@/services/anime.service";
import { type AnimeDetail } from "@/types/anime.type";
import { Loader2Icon, ArrowLeftIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import AboutTab from "@/components/admin/anime-detail/AboutTab";
import EpisodeTab from "@/components/admin/anime-detail/EpisodeTab";
import ReviewTab from "@/components/admin/anime-detail/ReviewTab";

export default function AdminAnimeDetail() {
  const [animeDetail, setAnimeDetail] = useState<AnimeDetail>();
  const [isLoadingAnimeDetail, setIsLoadingAnimeDetail] = useState(false);
  const { animeId } = useParams();

  const toast = useToast();
  const toastRef = useRef(toast.toast);

  const fetchAnimeById = useCallback(async () => {
    setIsLoadingAnimeDetail(true);
    const response = await fetchAnimeByIdService(animeId as string);
    if (response.success) {
      setAnimeDetail(response.data);
    } else {
      toastRef.current({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: response.error
      });
    }
    setIsLoadingAnimeDetail(false);
  }, [animeId]);

  useEffect(() => {
    fetchAnimeById();
  }, [fetchAnimeById]);

  return !isLoadingAnimeDetail && animeDetail ? (
    <div className="flex flex-col min-h-[100dvh]">
      <Link to="/admin">
        <Button variant="outline" className="absolute top-4 left-4">
          <ArrowLeftIcon className="mr-2 w-4 h-4" /> Back to list
        </Button>
      </Link>
      <header className="w-full bg-gradient-to-b xl:bg-gradient-to-r from-primary to-muted-foreground pt-20 pb-12 xl:py-12 px-4">
        <div className="container mx-auto flex flex-col xl:flex-row gap-6 items-center">
          <img
            src={animeDetail.images.large_image_url ?? "/placeholder.svg"}
            width={300}
            height={400}
            alt="Anime Cover"
            className="rounded-xl"
          />
          <div className="flex flex-col gap-4">
            <h1 className="text-white">{animeDetail.title}</h1>
            <p className="text-lg text-white/80 whitespace-pre-line">
              {animeDetail.synopsis}
            </p>
          </div>
        </div>
      </header>
      <main className="container mx-auto py-8 xl:py-12 px-8 xl:px-6">
        <Tabs defaultValue="about">
          <TabsList>
            <TabsTrigger value="about">About</TabsTrigger>
            {animeDetail.type !== "Movie" && (
              <TabsTrigger value="episodes">Episodes</TabsTrigger>
            )}
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <AboutTab animeDetail={animeDetail} />
          {animeDetail.type !== "Movie" && (
            <EpisodeTab animeDetail={animeDetail} />
          )}
          <ReviewTab animeDetail={animeDetail} resetParent={fetchAnimeById} />
        </Tabs>
      </main>
    </div>
  ) : (
    <div className="flex flex-col min-h-[100dvh] items-center justify-center gap-4">
      <img src="/loading.gif" className="w-32 h-32 rounded-xl" />
      <div className="flex items-center justify-center gap-2 xl:gap-4">
        <Loader2Icon className="w-8 h-8 xl:w-16 xl:h-16 animate-spin" />
        <h2>Fetching anime details...</h2>
      </div>
    </div>
  );
}
