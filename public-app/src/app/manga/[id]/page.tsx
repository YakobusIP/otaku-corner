import { fetchMangaByIdService } from "@/services/manga.service";

import GeneralFooter from "@/components/GeneralFooter";
import RatingDetailContent from "@/components/RatingDetailContent";
import ReviewContent from "@/components/ReviewContent";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressStatusBadge } from "@/components/ui/progress-status-badge";
import { Separator } from "@/components/ui/separator";

import { ratingDescriptions } from "@/lib/constants";

import {
  ArrowLeftIcon,
  BookOpenText,
  CalendarIcon,
  LibraryIcon,
  StarIcon
} from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = (await params).id;

  const fetchMangaById = async () => {
    const response = await fetchMangaByIdService(id);
    if (response.success) {
      return response.data;
    } else {
      redirect("/fetch-error");
    }
  };

  const mangaDetail = await fetchMangaById();

  return {
    title: `${mangaDetail.title} Manga Review | Otaku Corner`,
    description: `Delve into bearking58's review of ${mangaDetail.title}, providing a unique perspective and rating. Learn why this manga stands out or falls short in the collection.`
  };
}
export default async function Page({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;

  const fetchMangaById = async () => {
    const response = await fetchMangaByIdService(id);
    if (response.success) {
      return response.data;
    } else {
      redirect("/fetch-error");
    }
  };

  const mangaDetail = await fetchMangaById();
  const reviewObject = mangaDetail.review;

  const mangaPersonalRatings = [
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
      title: "Art Style",
      weight: "25",
      rating: reviewObject.artStyleRating
        ? `${reviewObject.artStyleRating} - ${
            ratingDescriptions[reviewObject.artStyleRating]
          }`
        : "N/A"
    },
    {
      title: "Character Development",
      weight: "20",
      rating: reviewObject.charDevelopmentRating
        ? `${reviewObject.charDevelopmentRating} - ${
            ratingDescriptions[reviewObject.charDevelopmentRating]
          }`
        : "N/A"
    },
    {
      title: "World Building",
      weight: "15",
      rating: reviewObject.worldBuildingRating
        ? `${reviewObject.worldBuildingRating} - ${
            ratingDescriptions[reviewObject.worldBuildingRating]
          }`
        : "N/A"
    },
    {
      title: "Originality",
      weight: "10",
      rating: reviewObject.originalityRating
        ? `${reviewObject.originalityRating} - ${
            ratingDescriptions[reviewObject.originalityRating]
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
                  {mangaDetail.title}
                </h1>
                <h2 className="text-muted-foreground">
                  ({mangaDetail.titleJapanese})
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm mt-2">
                <div>
                  Author:{" "}
                  {mangaDetail.authors.map((studio) => studio.name).join(", ")}
                </div>
                <div>Status: {mangaDetail.status}</div>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <ProgressStatusBadge
                  className="text-black border-none"
                  progressStatus={reviewObject.progressStatus}
                />
                {mangaDetail.genres.map((genre) => (
                  <Badge key={genre.id} variant="secondary">
                    {genre.name}
                  </Badge>
                ))}
                {mangaDetail.themes.map((theme) => (
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
                        i < Math.round(mangaDetail.score / 2)
                          ? "text-primary-foreground"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <div className="text-lg font-semibold">
                  {mangaDetail.score.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">(MAL Score)</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-primary">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
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
                    details={mangaPersonalRatings}
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
                {mangaDetail.synopsis}
              </p>
            </div>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="aspect-[3/4] overflow-hidden">
                <Image
                  src={
                    mangaDetail.images.large_image_url ||
                    mangaDetail.images.image_url
                  }
                  alt={mangaDetail.title}
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
                    <BookOpenText className="w-5 h-5" />
                    <div className="text-lg font-semibold">
                      {mangaDetail.chaptersCount
                        ? `${mangaDetail.chaptersCount} chapter(s)`
                        : "Unknown chapters"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <LibraryIcon className="w-5 h-5" />
                    <div>
                      {mangaDetail.volumesCount
                        ? `${mangaDetail.volumesCount} volume(s)`
                        : "Unknown volumes"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5" />
                    <div>{mangaDetail.published}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </header>
      <section className="container space-y-2">
        <h3>My Review</h3>
        {!reviewObject.review ? (
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
          <ReviewContent review={reviewObject.review} />
        )}
      </section>
      <div className="container">
        <div className="flex justify-center mt-12">
          <Link
            href="/manga"
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
