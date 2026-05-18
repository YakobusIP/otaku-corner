"use client";

import GeneralFooter from "@/components/GeneralFooter";
import RatingDetailContent from "@/components/RatingDetailContent";
import ReviewContent from "@/components/ReviewContent";
import SpoilerWarningModal from "@/components/SpoilerWarningModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressStatusBadge } from "@/components/ui/progress-status-badge";

import { useMangaDetailPage } from "@/hooks/useMangaDetailPage";

import { formatMalScoreWithMax } from "@/lib/utils";

import {
  AlertTriangleIcon,
  BookOpenIcon,
  CalendarIcon,
  ClockIcon,
  EyeIcon,
  EyeOffIcon,
  UserIcon
} from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";

type Props = {
  id: number;
};

export default function MangaDetail({ id }: Props) {
  const {
    mangaDetail,
    mangaPersonalRatings,
    showSpoilerWarning,
    setShowSpoilerWarning,
    spoilersRevealed,
    setSpoilersRevealed,
    handleRevealSpoilers
  } = useMangaDetailPage(id);

  if (!mangaDetail) {
    notFound();
  }

  const reviewObject = mangaDetail.review;

  return (
    <div className="min-h-screen bg-linear-to-r from-[#ffafbd] via-[#ffc3a0] to-[#ffeecf]">
      <div className="container px-4 py-8">
        <header className="grid lg:grid-cols-1 gap-8 mb-8">
          <Card className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="shrink-0">
                  <Image
                    src={
                      mangaDetail.images.large_image_url ||
                      mangaDetail.images.image_url
                    }
                    alt={mangaDetail.title}
                    width={300}
                    height={400}
                    className="rounded-lg shadow-xl object-cover border border-slate-200 aspect-3/4"
                    priority
                  />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
                      {mangaDetail.title}
                    </h1>
                    <p className="text-slate-700 text-lg">
                      ({mangaDetail.titleJapanese})
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {mangaDetail.genres.map((genre) => (
                      <Badge
                        key={genre.id}
                        className="bg-slate-800/80 backdrop-blur-sm text-white border border-slate-700/30"
                      >
                        {genre.name}
                      </Badge>
                    ))}
                    {mangaDetail.themes.map((theme) => (
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
                      <div>{mangaDetail.published}</div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <BookOpenIcon className="w-5 h-5" />
                      <span>
                        {mangaDetail.chaptersCount
                          ? `${mangaDetail.chaptersCount} chapter(s)`
                          : "Unknown chapters"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <UserIcon className="w-5 h-5" />
                      <span>
                        {mangaDetail.authors
                          .map((author) => author.name)
                          .join(", ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <ClockIcon className="w-5 h-5" />
                      <span>{mangaDetail.status}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/40">
                      <div className="text-slate-600 text-sm mb-1">
                        MAL Score
                      </div>
                      <div className="text-2xl font-bold text-slate-800">
                        {formatMalScoreWithMax(mangaDetail.score)}
                      </div>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/40">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-slate-600 text-sm mb-1">
                            My Score
                          </div>
                          <div className="text-2xl font-bold text-slate-800">
                            {formatMalScoreWithMax(reviewObject?.personalScore)}
                          </div>
                        </div>
                        <RatingDetailContent
                          details={mangaPersonalRatings}
                          finalScore={reviewObject?.personalScore}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/40">
                      <div className="text-slate-600 text-sm mb-2">
                        Reading Status
                      </div>
                      {reviewObject ? (
                        <ProgressStatusBadge
                          progressStatus={reviewObject.progressStatus}
                        />
                      ) : (
                        <span className="text-slate-600 text-sm">
                          No personal entry
                        </span>
                      )}
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/40">
                      <div className="text-slate-600 text-sm mb-2">
                        Series Progress
                      </div>
                      <div className="text-slate-800 font-semibold">
                        {mangaDetail.chaptersCount
                          ? `${mangaDetail.chaptersCount} chapter(s)`
                          : "Unknown chapters"}
                      </div>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/40">
                      <div className="text-slate-600 text-sm mb-2">Volumes</div>
                      <div className="text-slate-800 font-semibold">
                        {mangaDetail.volumesCount
                          ? `${mangaDetail.volumesCount} volume(s)`
                          : "Unknown volumes"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </header>

        <Card className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl mb-8">
          <CardHeader>
            <CardTitle className="text-slate-800">Synopsis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-800 leading-relaxed whitespace-pre-line">
              {mangaDetail.synopsis}
            </p>
          </CardContent>
        </Card>

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
            {!reviewObject?.reviewText ? (
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
                      This review contains spoilers that may reveal important
                      plot points and story outcomes.
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
