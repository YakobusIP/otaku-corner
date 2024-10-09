import { useToast } from "@/components/ui/use-toast";
import { fetchAnimeByIdService } from "@/services/anime.service";
import { type AnimeDetail } from "@/types/anime.type";
import {
  Loader2,
  StarIcon,
  FilmIcon,
  ClockIcon,
  CalendarIcon,
  ArrowLeftIcon,
  HeartIcon,
  InfoIcon
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipProvider,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GeneralFooter from "@/components/general/GeneralFooter";
import DOMPurify from "dompurify";
import { ProgressStatusBadge } from "@/components/ui/progress-status-badge";
import { ratingDescriptions } from "@/lib/constants";
import RatingDetailContent from "@/components/general/RatingDetailContent";
import { isMobile } from "react-device-detect";

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
  const navigate = useNavigate();

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
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: response.error
      });
      navigate("*");
    }
    setIsLoadingAnimeDetail(false);
  }, [animeId, navigate]);

  useEffect(() => {
    fetchAnimeById();
  }, [fetchAnimeById]);

  const animePersonalRatings = [
    {
      title: "Storyline",
      weight: "30",
      rating: animeDetail?.storylineRating
        ? `${animeDetail.storylineRating} - ${
            ratingDescriptions[animeDetail.storylineRating]
          }`
        : "N/A"
    },
    {
      title: "Animation Quality",
      weight: "25",
      rating: animeDetail?.qualityRating
        ? `${animeDetail.qualityRating} - ${
            ratingDescriptions[animeDetail.qualityRating]
          }`
        : "N/A"
    },
    {
      title: "Voice Acting",
      weight: "20",
      rating: animeDetail?.voiceActingRating
        ? `${animeDetail.voiceActingRating} - ${
            ratingDescriptions[animeDetail.voiceActingRating]
          }`
        : "N/A"
    },
    {
      title: "Soundtrack",
      weight: "15",
      rating: animeDetail?.soundTrackRating
        ? `${animeDetail.soundTrackRating} - ${
            ratingDescriptions[animeDetail.soundTrackRating]
          }`
        : "N/A"
    },
    {
      title: "Character Development",
      weight: "10",
      rating: animeDetail?.charDevelopmentRating
        ? `${animeDetail.charDevelopmentRating} - ${
            ratingDescriptions[animeDetail.charDevelopmentRating]
          }`
        : "N/A"
    }
  ];

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
    <div className="text-foreground space-y-8">
      <header className="bg-primary bg-gradient-to-b from-primary to-muted-foreground text-primary-foreground py-12">
        <div className="container flex flex-col-reverse xl:flex-row items-center justify-center gap-4 xl:gap-16">
          <div className="flex flex-col gap-4 xl:gap-16 w-full xl:w-4/5">
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
                {animeDetail.progressStatus && (
                  <ProgressStatusBadge
                    className="text-black border-none"
                    progressStatus={animeDetail.progressStatus}
                  />
                )}
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
            <div className="flex flex-col xl:flex-row justify-center xl:justify-normal gap-4 xl:gap-16">
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
                <p className="text-lg font-semibold">
                  {animeDetail.score.toFixed(2)}
                </p>
                <div className="text-sm text-muted-foreground">(MAL Score)</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-primary">
                  {[...Array(5)].map((_, i) => (
                    <HeartIcon
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.round((animeDetail.personalScore ?? 0) / 2)
                          ? "text-yellow-600"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold">
                    {animeDetail.personalScore
                      ? animeDetail.personalScore.toFixed(2)
                      : "N/A"}
                  </p>
                  {isMobile ? (
                    <Popover>
                      <PopoverTrigger>
                        <InfoIcon className="w-4 h-4" />
                      </PopoverTrigger>
                      <PopoverContent className="w-64">
                        <RatingDetailContent
                          details={animePersonalRatings}
                          finalScore={animeDetail.personalScore}
                        />
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <InfoIcon className="w-4 h-4" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <RatingDetailContent
                            details={animePersonalRatings}
                            finalScore={animeDetail.personalScore}
                          />
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  (Personal Score)
                </div>
              </div>
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
                    <div className="text-lg font-semibold">
                      {animeDetail.episodes.length} Episodes
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-5 h-5" />
                    <div>{animeDetail.duration}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5" />
                    <div>{animeDetail.aired}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </header>
      <section className="container flex items-center justify-center">
        <Card className="w-full xl:w-2/5">
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
      <section className="container">
        <Separator className="mb-4" />
        <div className="flex flex-col gap-4">
          <h3>Episodes</h3>
          <Table>
            <TableCaption>{animeDetail.title}'s list of episodes</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px] xl:w-[150px]">
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
      </section>
      <section className="container space-y-2">
        <Separator className="mb-4" />
        <h3>My Review</h3>
        {!animeDetail.review || animeDetail.review === "<p></p>\n" ? (
          <div className="flex flex-col items-center justify-center gap-2 xl:gap-4">
            <img src="/no-review.gif" className="w-64 rounded-xl" />
            <p className="text-center text-muted-foreground">
              No review available
            </p>
          </div>
        ) : (
          <div
            className="flex flex-col gap-4"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(animeDetail.review)
            }}
          />
        )}
      </section>
      <div className="flex justify-center mt-12">
        <Link
          to="/anime"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
      </div>
      <GeneralFooter />
    </div>
  ) : (
    <div className="flex flex-col min-h-[100dvh] items-center justify-center gap-4">
      <img src="/loading.gif" className="w-32 h-32 rounded-xl" />
      <div className="flex items-center justify-center gap-2 xl:gap-4">
        <Loader2 className="w-8 h-8 xl:w-16 xl:h-16 animate-spin" />
        <h2>Fetching anime details...</h2>
      </div>
    </div>
  );
}
