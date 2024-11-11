import { fetchLightNovelByIdService } from "@/services/lightnovel.service";

import GeneralFooter from "@/components/GeneralFooter";
import RatingDetailContent from "@/components/RatingDetailContent";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { ProgressStatusBadge } from "@/components/ui/progress-status-badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

import { ratingDescriptions } from "@/lib/constants";

import DOMPurify from "isomorphic-dompurify";
import {
  ArrowLeftIcon,
  CalendarIcon,
  HeartIcon,
  InfoIcon,
  LibraryIcon,
  StarIcon
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isMobile } from "react-device-detect";

export default async function Page({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;

  const fetchLightNovelById = async () => {
    const response = await fetchLightNovelByIdService(id);
    if (response.success) {
      return response.data;
    } else {
      redirect("/fetch-error");
    }
  };

  const lightNovelDetail = await fetchLightNovelById();

  const lightNovelPersonalRatings = [
    {
      title: "Storyline",
      weight: "30",
      rating: lightNovelDetail?.storylineRating
        ? `${lightNovelDetail.storylineRating} - ${
            ratingDescriptions[lightNovelDetail.storylineRating]
          }`
        : "N/A"
    },
    {
      title: "World Building",
      weight: "25",
      rating: lightNovelDetail?.worldBuildingRating
        ? `${lightNovelDetail.worldBuildingRating} - ${
            ratingDescriptions[lightNovelDetail.worldBuildingRating]
          }`
        : "N/A"
    },
    {
      title: "Writing Style",
      weight: "20",
      rating: lightNovelDetail?.writingStyleRating
        ? `${lightNovelDetail.writingStyleRating} - ${
            ratingDescriptions[lightNovelDetail.writingStyleRating]
          }`
        : "N/A"
    },
    {
      title: "Character Development",
      weight: "15",
      rating: lightNovelDetail?.charDevelopmentRating
        ? `${lightNovelDetail.charDevelopmentRating} - ${
            ratingDescriptions[lightNovelDetail.charDevelopmentRating]
          }`
        : "N/A"
    },
    {
      title: "Originality",
      weight: "10",
      rating: lightNovelDetail?.originalityRating
        ? `${lightNovelDetail.originalityRating} - ${
            ratingDescriptions[lightNovelDetail.originalityRating]
          }`
        : "N/A"
    }
  ];

  return (
    <div className="text-foreground space-y-8 min-h-screen">
      <header className="bg-primary bg-gradient-to-b from-primary to-muted-foreground text-primary-foreground py-12">
        <div className="container flex flex-col-reverse xl:flex-row items-center justify-center gap-4 xl:gap-16">
          <div className="flex flex-col gap-4 xl:gap-16 w-full xl:w-4/5">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl sm:text-4xl font-bold">
                  {lightNovelDetail.title}
                </h1>
                <h2 className="text-muted-foreground">
                  ({lightNovelDetail.titleJapanese})
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm mt-2">
                <div>
                  Author:{" "}
                  {lightNovelDetail.authors
                    .map((studio) => studio.name)
                    .join(", ")}
                </div>
                <div>Status: {lightNovelDetail.status}</div>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {lightNovelDetail.progressStatus && (
                  <ProgressStatusBadge
                    className="text-black border-none"
                    progressStatus={lightNovelDetail.progressStatus}
                  />
                )}
                {lightNovelDetail.genres.map((genre) => (
                  <Badge key={genre.id} variant="secondary">
                    {genre.name}
                  </Badge>
                ))}
                {lightNovelDetail.themes.map((theme) => (
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
                        i < Math.round(lightNovelDetail.score / 2)
                          ? "text-primary-foreground"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <div className="text-lg font-semibold">
                  {lightNovelDetail.score.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">(MAL Score)</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-primary">
                  {[...Array(5)].map((_, i) => (
                    <HeartIcon
                      key={`heart-${i}`}
                      className={`w-5 h-5 ${
                        i <
                        Math.round((lightNovelDetail.personalScore ?? 0) / 2)
                          ? "text-yellow-600"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold">
                    {lightNovelDetail.personalScore
                      ? lightNovelDetail.personalScore.toFixed(2)
                      : "N/A"}
                  </p>
                  {isMobile ? (
                    <Popover>
                      <PopoverTrigger>
                        <InfoIcon className="w-4 h-4" />
                      </PopoverTrigger>
                      <PopoverContent className="w-64">
                        <RatingDetailContent
                          details={lightNovelPersonalRatings}
                          finalScore={lightNovelDetail.personalScore}
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
                            details={lightNovelPersonalRatings}
                            finalScore={lightNovelDetail.personalScore}
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
                {lightNovelDetail.synopsis}
              </p>
            </div>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="aspect-[3/4] overflow-hidden">
                <Image
                  src={
                    lightNovelDetail.images.large_image_url ||
                    lightNovelDetail.images.image_url
                  }
                  alt={lightNovelDetail.title}
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
                    <LibraryIcon className="w-5 h-5" />
                    <div className="text-lg font-semibold">
                      {lightNovelDetail.volumesCount
                        ? `${lightNovelDetail.volumesCount} volume(s)`
                        : "Unknown volumes"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5" />
                    <div>{lightNovelDetail.published}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </header>
      <section className="container space-y-2">
        <h3>My Review</h3>
        {!lightNovelDetail.review || lightNovelDetail.review === "<p></p>\n" ? (
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
          <div
            className="flex flex-col gap-4"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(lightNovelDetail.review)
            }}
          />
        )}
      </section>
      <div className="container">
        <div className="flex justify-center mt-12">
          <Link
            href="/light-novel"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
      <GeneralFooter />
    </div>
  );
}
