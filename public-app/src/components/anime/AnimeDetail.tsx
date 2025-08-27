"use client";

import { useState } from "react";

import { animeService } from "@/services/anime.service";

import GeneralFooter from "@/components/GeneralFooter";
import RatingDetailContent from "@/components/RatingDetailContent";
import ReviewContent from "@/components/ReviewContent";
import SpoilerWarningModal from "@/components/SpoilerWarningModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressStatusBadge } from "@/components/ui/progress-status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useToast } from "@/hooks/useToast";

import { ratingDescriptions } from "@/lib/constants";

import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangleIcon,
  BookOpenIcon,
  CalendarIcon,
  ClockIcon,
  EyeIcon,
  EyeOffIcon,
  FilmIcon
} from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";

type Props = {
  id: number;
};

export default function AnimeDetail({ id }: Props) {
  const [showSpoilerWarning, setShowSpoilerWarning] = useState(false);
  const [spoilersRevealed, setSpoilersRevealed] = useState(false);

  const toast = useToast();

  const { data: animeDetail, error } = useQuery({
    queryKey: ["anime", id],
    queryFn: () => animeService.fetchById(id)
  });

  if (!animeDetail) {
    notFound();
  }

  if (error) {
    toast.toast({
      variant: "destructive",
      title: "Uh oh! Something went wrong",
      description: error.message
    });
  }

  const reviewObject = animeDetail.review;

  const embedURL = animeDetail.trailer?.replace(
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

  const handleRevealSpoilers = () => setShowSpoilerWarning(true);

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#ffafbd] via-[#ffc3a0] to-[#ffeecf]">
      <div className="container px-4 py-8">
        <header className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <Image
                      src={
                        animeDetail.images.large_image_url ||
                        animeDetail.images.image_url
                      }
                      alt={animeDetail.title}
                      width={300}
                      height={400}
                      className="rounded-lg shadow-xl object-cover border border-slate-200 aspect-[3/4]"
                      priority
                    />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
                        {animeDetail.title}
                      </h1>
                      <p className="text-slate-700 text-lg">
                        ({animeDetail.titleJapanese})
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {animeDetail.genres.map((genre) => (
                        <Badge
                          key={genre.id}
                          className="bg-slate-800/80 backdrop-blur-sm text-white border border-slate-700/30"
                        >
                          {genre.name}
                        </Badge>
                      ))}
                      {animeDetail.themes.map((theme) => (
                        <Badge
                          key={theme.id}
                          className="bg-slate-800/80 backdrop-blur-sm text-white border border-slate-700/30"
                        >
                          {theme.name}
                        </Badge>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-slate-700">
                        <CalendarIcon className="w-5 h-5" />
                        <div>{animeDetail.aired}</div>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <ClockIcon className="w-5 h-5" />
                        <div>{animeDetail.duration}</div>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <BookOpenIcon className="w-5 h-5" />
                        <span>{animeDetail.episodes.length} Episodes</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <FilmIcon className="w-5 h-5" />
                        <span>
                          {animeDetail.studios
                            .map((studio) => studio.name)
                            .join(", ")}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/40">
                        <div className="text-slate-600 text-sm mb-1">
                          MAL Score
                        </div>
                        <div className="text-2xl font-bold text-slate-800">
                          {animeDetail.score.toFixed(2)}/10
                        </div>
                      </div>
                      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/40">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-slate-600 text-sm mb-1">
                              My Score
                            </div>
                            <div className="text-2xl font-bold text-slate-800">
                              {reviewObject.personalScore
                                ? reviewObject.personalScore.toFixed(2)
                                : "N/A"}
                              /10
                            </div>
                          </div>
                          <RatingDetailContent
                            details={animePersonalRatings}
                            finalScore={reviewObject.personalScore}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/40">
                        <div className="text-slate-600 text-sm mb-2">
                          Watch Status
                        </div>
                        <ProgressStatusBadge
                          className="text-black border-none"
                          progressStatus={reviewObject.progressStatus}
                        />
                      </div>
                      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/40">
                        <div className="text-slate-600 text-sm mb-2">
                          Season Progress
                        </div>
                        <div className="text-slate-800 font-semibold">
                          {animeDetail.episodes.length} /{" "}
                          {animeDetail.episodesCount ?? 0} Episodes
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl h-fit">
              <CardHeader>
                <CardTitle className="text-slate-800">Trailer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-slate-800/20 rounded-lg border border-slate-200 flex items-center justify-center group cursor-pointer hover:bg-slate-800/30 transition-colors">
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
          </div>
        </header>

        <Card className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl mb-8">
          <CardHeader>
            <CardTitle className="text-slate-800">Synopsis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-800 leading-relaxed whitespace-pre-line">
              {animeDetail.synopsis}
            </p>
          </CardContent>
        </Card>

        <Tabs defaultValue="episodes" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-xl border border-white/40">
            <TabsTrigger
              value="episodes"
              className="data-[state=active]:bg-white data-[state=active]:text-slate-800 text-slate-700"
            >
              Episodes ({animeDetail.episodesCount})
            </TabsTrigger>
            <TabsTrigger
              value="review"
              className="data-[state=active]:bg-white data-[state=active]:text-slate-800 text-slate-700"
            >
              My Review
            </TabsTrigger>
          </TabsList>

          <TabsContent value="episodes" className="mt-6">
            <Card className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-slate-800">Episodes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {animeDetail.episodes.map((episode) => {
                    return (
                      <div
                        key={episode.id}
                        className="p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <span className="text-slate-700 font-mono text-sm w-8 bg-white/10 rounded px-2 py-1 text-center">
                              {episode.number.toString().padStart(2, "0")}
                            </span>
                            <div>
                              <h3 className="text-slate-800 font-medium">
                                {episode.title}
                              </h3>

                              <div className="flex flex-col lg:flex-row gap-2 lg:gap-4 text-sm text-slate-600">
                                {episode.titleRomaji && (
                                  <span>
                                    {episode.titleRomaji}{" "}
                                    {episode.titleJapanese &&
                                      `(${episode.titleJapanese})`}
                                  </span>
                                )}
                                <span>{episode.aired}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="review" className="mt-6">
            <Card className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-slate-800">My Review</CardTitle>
                  {!spoilersRevealed && (
                    <Button
                      onClick={handleRevealSpoilers}
                      variant="outline"
                      size="sm"
                      className="border-orange-300 text-orange-700 hover:bg-orange-50"
                    >
                      <EyeOffIcon />
                      Reveal Spoilers
                    </Button>
                  )}
                  {spoilersRevealed && (
                    <Badge className="bg-orange-100 text-orange-800 border border-orange-300 hover:bg-orange-200">
                      <EyeIcon className="mr-1" size={12} />
                      Spoilers Visible
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!reviewObject.reviewText ? (
                  <div className="flex flex-col items-center justify-center gap-2 xl:gap-4">
                    <Image
                      src="/no-review.gif"
                      width={500}
                      height={300}
                      className="w-64 rounded-xl"
                      alt="No review"
                      unoptimized
                    />
                    <p className="text-center text-muted-foreground">
                      No review available
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    {!spoilersRevealed && (
                      <div className="absolute inset-0 z-10 bg-white/95 backdrop-blur-md rounded-lg border-2 border-dashed border-orange-300 flex flex-col items-center text-center p-8">
                        <AlertTriangleIcon
                          className="text-orange-500 mb-4"
                          size={48}
                        />
                        <h3 className="text-xl font-bold text-slate-800 mb-2">
                          Spoiler Warning
                        </h3>
                        <p className="text-slate-600 mb-4 max-w-md">
                          This review contains spoilers that may reveal
                          important plot points and story outcomes.
                        </p>
                        <Button
                          onClick={handleRevealSpoilers}
                          className="bg-orange-600 hover:bg-orange-700 text-white"
                        >
                          <EyeIcon size={16} />
                          Click to Reveal Review
                        </Button>
                      </div>
                    )}
                    <ReviewContent
                      review={reviewObject.reviewText}
                      spoilersRevealed={spoilersRevealed}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <GeneralFooter />
      <SpoilerWarningModal
        showSpoilerWarning={showSpoilerWarning}
        setShowSpoilerWarning={setShowSpoilerWarning}
        setSpoilersRevealed={setSpoilersRevealed}
      />
    </div>
  );
}
