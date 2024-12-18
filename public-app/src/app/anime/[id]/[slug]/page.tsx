import { fetchAnimeByIdService } from "@/services/anime.service";

import BackToListButton from "@/components/BackToListButton";
import GeneralFooter from "@/components/GeneralFooter";
import RatingDetailContent from "@/components/RatingDetailContent";
import ReviewContent from "@/components/ReviewContent";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressStatusBadge } from "@/components/ui/progress-status-badge";
import { Separator } from "@/components/ui/separator";
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

import { ratingDescriptions } from "@/lib/constants";

import {
  CalendarIcon,
  ClockIcon,
  FilmIcon,
  HeartIcon,
  StarIcon
} from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ id: number; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = (await params).id;
  const slug = (await params).slug;

  const fetchAnimeById = async () => {
    const response = await fetchAnimeByIdService(id);
    if (response.success) {
      return response.data;
    } else {
      console.error("Error on fetching metadata anime:", response.error);
      redirect("/fetch-error");
    }
  };

  const animeDetail = await fetchAnimeById();

  return {
    title: `${animeDetail.title} Anime Review | Otaku Corner`,
    description: `Read bearking58's in-depth review of ${animeDetail.title}, offering a personal perspective and rating. Uncover what makes this anime a hit or miss in the collection.`,
    alternates: {
      canonical: `/anime/${id}/${slug}`
    }
  };
}

export default async function Page({ params }: Props) {
  const id = (await params).id;

  const fetchAnimeById = async () => {
    const response = await fetchAnimeByIdService(id);
    if (response.success) {
      return response.data;
    } else {
      console.error("Error on fetching page anime:", response.error);
      redirect("/fetch-error");
    }
  };

  const animeDetail = await fetchAnimeById();
  const reviewObject = animeDetail.review;

  const embedURL = animeDetail?.trailer?.replace(
    /(autoplay=)[^&]+/,
    "autoplay=0"
  );

  const animePersonalRatings = [
    {
      title: "Storyline",
      weight: "30",
      rating: reviewObject.storylineRating
        ? `${reviewObject.storylineRating} - ${
            ratingDescriptions[reviewObject.storylineRating]
          }`
        : "N/A"
    },
    {
      title: "Animation Quality",
      weight: "25",
      rating: reviewObject.qualityRating
        ? `${reviewObject.qualityRating} - ${
            ratingDescriptions[reviewObject.qualityRating]
          }`
        : "N/A"
    },
    {
      title: "Voice Acting",
      weight: "20",
      rating: reviewObject.voiceActingRating
        ? `${reviewObject.voiceActingRating} - ${
            ratingDescriptions[reviewObject.voiceActingRating]
          }`
        : "N/A"
    },
    {
      title: "Soundtrack",
      weight: "15",
      rating: reviewObject.soundTrackRating
        ? `${reviewObject.soundTrackRating} - ${
            ratingDescriptions[reviewObject.soundTrackRating]
          }`
        : "N/A"
    },
    {
      title: "Character Development",
      weight: "10",
      rating: reviewObject.charDevelopmentRating
        ? `${reviewObject.charDevelopmentRating} - ${
            ratingDescriptions[reviewObject.charDevelopmentRating]
          }`
        : "N/A"
    }
  ];

  return (
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
                <ProgressStatusBadge
                  className="text-black border-none"
                  progressStatus={reviewObject.progressStatus}
                />
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
                      key={`star-${i}`}
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
                      key={`heart-${i}`}
                      className={`w-5 h-5 ${
                        i < Math.round((reviewObject.personalScore ?? 0) / 2)
                          ? "text-yellow-600"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold">
                    {reviewObject.personalScore
                      ? reviewObject.personalScore.toFixed(2)
                      : "N/A"}
                  </p>
                  <RatingDetailContent
                    details={animePersonalRatings}
                    finalScore={reviewObject.personalScore}
                  />
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
                <Image
                  src={
                    animeDetail.images.large_image_url ||
                    animeDetail.images.image_url
                  }
                  alt={animeDetail.title}
                  width={300}
                  height={400}
                  className="w-full h-auto rounded-t-lg object-cover"
                  priority
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
            <TableCaption>
              {animeDetail.title}&apos;s list of episodes
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px] xl:w-[150px]">
                  Episode Number
                </TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="text-center">Airing Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {animeDetail.episodes.length > 0 ? (
                animeDetail.episodes.map((episode) => (
                  <TableRow key={`episode-${episode.number}`}>
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
        {!reviewObject.reviewText ? (
          <div className="flex flex-col items-center justify-center gap-2 xl:gap-4">
            <Image
              src="/no-review.gif"
              width={500}
              height={300}
              className="w-64 rounded-xl"
              alt="No review"
            />
            <p className="text-center text-muted-foreground">
              No review available
            </p>
          </div>
        ) : (
          <ReviewContent review={reviewObject.reviewText} />
        )}
      </section>
      <div className="flex justify-center mt-12">
        <BackToListButton fallbackHref="/anime?page=1" />
      </div>
      <GeneralFooter />
    </div>
  );
}
