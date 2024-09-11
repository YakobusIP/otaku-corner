import { useToast } from "@/components/ui/use-toast";
import { fetchAnimeByIdService } from "@/services/anime.service";
import { type AnimeDetail } from "@/types/anime.type";
import {
  Loader2,
  StarIcon,
  FilmIcon,
  ClockIcon,
  CalendarIcon,
  ArrowLeftIcon
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function GeneralAnimeDetail() {
  const [animeDetail, setAnimeDetail] = useState<AnimeDetail>();
  const [isLoadingAnimeDetail, setIsLoadingAnimeDetail] = useState(false);

  const calculateEpisodeNumberTitle = () => {
    if (window.innerWidth < 1024) return "No";
    else return "Episode Number";
  };

  const [episodeNumberTitle, setEpisodeNumberTitle] = useState(
    calculateEpisodeNumberTitle()
  );
  const { animeId } = useParams();

  const embedURL = animeDetail?.trailer?.replace(
    /(autoplay=)[^&]+/,
    "autoplay=0"
  );

  const toast = useToast();
  const toastRef = useRef(toast.toast);

  const fetchAnimeById = useCallback(async () => {
    setIsLoadingAnimeDetail(true);
    const response = await fetchAnimeByIdService(animeId as string);
    if (response.success) {
      setAnimeDetail(response.data);
    } else {
      toastRef.current({
        title: "Uh oh! Something went wrong",
        description: response.error
      });
    }
    setIsLoadingAnimeDetail(false);
  }, [animeId]);

  useEffect(() => {
    fetchAnimeById();
  }, [fetchAnimeById]);

  useEffect(() => {
    const handleResize = () => {
      setEpisodeNumberTitle(calculateEpisodeNumberTitle());
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return !isLoadingAnimeDetail && animeDetail ? (
    <div className="text-foreground space-y-8 pb-8">
      <header className="bg-primary text-primary-foreground py-12">
        <div className="container flex flex-col-reverse lg:flex-row items-center justify-center gap-16">
          <div className="flex flex-col gap-4 lg:gap-16 w-full lg:w-4/5">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl sm:text-4xl font-bold">
                  {animeDetail.title}
                </h1>
                <h2 className="text-muted-foreground">
                  ({animeDetail.titleJapanese})
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm mt-2">
                <div>
                  Studio:{" "}
                  {animeDetail.studios.map((studio) => studio.name).join(", ")}
                </div>
                <div>Type: {animeDetail.type}</div>
                <div>Status: {animeDetail.status}</div>
                {animeDetail.season && <div>Season: {animeDetail.season}</div>}
                <div>Broadcast: {animeDetail.broadcast}</div>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {animeDetail.genres.map((genre) => (
                  <Badge key={genre.id} variant="secondary">
                    {genre.name}
                  </Badge>
                ))}
                {animeDetail.themes.map((theme) => (
                  <Badge key={theme.id} variant="secondary">
                    {theme.name}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-primary">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.round(animeDetail.score / 2)
                        ? "text-primary-foreground"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <div className="text-lg font-semibold">{animeDetail.score}</div>
              <div className="text-sm text-muted-foreground">(MAL Score)</div>
            </div>
            <div>
              <p className="text-justify whitespace-pre-line">
                {animeDetail.synopsis}
              </p>
            </div>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="aspect-[3/4] overflow-hidden">
                <img
                  src={
                    animeDetail.images.large_image_url ||
                    animeDetail.images.image_url
                  }
                  alt={animeDetail.title}
                  className="w-full h-auto rounded-t-lg object-cover"
                />
              </div>
              <Separator />
              <div className="p-6">
                <div className="grid gap-4">
                  <div className="flex items-center gap-2">
                    <FilmIcon className="w-5 h-5" />
                    <div className="text-lg font-semibold">12 Episodes</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-5 h-5" />
                    <div>24 min per ep</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5" />
                    <div>Apr 9, 2022 to Jun 25, 2022</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </header>
      <section className="container flex items-center justify-center">
        <Card className="w-full lg:w-2/5">
          <CardHeader>
            <CardTitle>Trailer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={embedURL}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Anime Trailer"
              ></iframe>
            </div>
          </CardContent>
        </Card>
      </section>
      <div className="container">
        <Separator className="mb-4" />
        <div className="flex flex-col gap-4">
          <h3>Episodes</h3>
          <Table>
            <TableCaption>{animeDetail.title}'s list of episodes</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px] lg:w-[150px]">
                  {episodeNumberTitle}
                </TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="text-center">Airing Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {animeDetail.episodes.length > 0 ? (
                animeDetail.episodes.map((episode) => (
                  <TableRow key={episode.number}>
                    <TableCell className="font-medium">
                      {episode.number}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <h4>{episode.title}</h4>
                        {episode.titleRomaji && (
                          <p className="text-muted-foreground">
                            {episode.titleRomaji}{" "}
                            {episode.titleJapanese &&
                              `(${episode.titleJapanese})`}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {episode.aired}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    No episodes available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell
                  colSpan={3}
                  className={`text-center ${
                    animeDetail.episodes.length === 0 ||
                    !animeDetail.episodesCount
                      ? "text-destructive"
                      : animeDetail.episodes.length < animeDetail.episodesCount
                      ? "text-yellow-400"
                      : "text-green-700"
                  }`}
                >
                  Season episode progress: {animeDetail.episodes.length} /{" "}
                  {animeDetail.episodesCount ?? 0}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
        <div className="flex justify-center mt-12">
          <Link
            to="/anime"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  ) : (
    <div className="flex flex-col min-h-[100dvh] items-center justify-center gap-4">
      <img src="/loading.gif" className="w-32 h-32 rounded-xl" />
      <div className="flex items-center justify-center gap-2 lg:gap-4">
        <Loader2 className="w-8 h-8 lg:w-16 lg:h-16 animate-spin" />
        <h2>Fetching anime details...</h2>
      </div>
    </div>
  );
}
