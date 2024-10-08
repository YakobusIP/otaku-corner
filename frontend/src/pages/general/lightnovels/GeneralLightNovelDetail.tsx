import { useToast } from "@/components/ui/use-toast";
import { fetchLightNovelByIdService } from "@/services/lightnovel.service";
import { type LightNovelDetail } from "@/types/lightnovel.type";
import {
  Loader2,
  StarIcon,
  CalendarIcon,
  ArrowLeftIcon,
  Library
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import GeneralFooter from "@/components/general/GeneralFooter";
import DOMPurify from "dompurify";
import { ProgressStatusBadge } from "@/components/ui/progress-status-badge";

export default function GeneralLightNovelDetail() {
  const [lightNovelDetail, setLightNovelDetail] = useState<LightNovelDetail>();
  const [isLoadingLightNovelDetail, setIsLoadingLightNovelDetail] =
    useState(false);
  const { lightNovelId } = useParams();

  const toast = useToast();
  const toastRef = useRef(toast.toast);

  const fetchLightNovelById = useCallback(async () => {
    setIsLoadingLightNovelDetail(true);
    const response = await fetchLightNovelByIdService(lightNovelId as string);
    if (response.success) {
      setLightNovelDetail(response.data);
    } else {
      toastRef.current({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: response.error
      });
    }
    setIsLoadingLightNovelDetail(false);
  }, [lightNovelId]);

  useEffect(() => {
    fetchLightNovelById();
  }, [fetchLightNovelById]);

  return !isLoadingLightNovelDetail && lightNovelDetail ? (
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
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-primary">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.round(lightNovelDetail.score / 2)
                        ? "text-primary-foreground"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <div className="text-lg font-semibold">
                {lightNovelDetail.score}
              </div>
              <div className="text-sm text-muted-foreground">(MAL Score)</div>
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
                <img
                  src={
                    lightNovelDetail.images.large_image_url ||
                    lightNovelDetail.images.image_url
                  }
                  alt={lightNovelDetail.title}
                  className="w-full h-auto rounded-t-lg object-cover"
                />
              </div>
              <Separator />
              <div className="p-6">
                <div className="grid gap-4">
                  <div className="flex items-center gap-2">
                    <Library className="w-5 h-5" />
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
            <img src="/no-review.gif" className="w-64 rounded-xl" />
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
            to="/lightnovel"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
      <GeneralFooter />
    </div>
  ) : (
    <div className="flex flex-col min-h-[100dvh] items-center justify-center gap-4">
      <img src="/loading.gif" className="w-32 h-32 rounded-xl" />
      <div className="flex items-center justify-center gap-2 xl:gap-4">
        <Loader2 className="w-8 h-8 xl:w-16 xl:h-16 animate-spin" />
        <h2>Fetching light novel details...</h2>
      </div>
    </div>
  );
}
